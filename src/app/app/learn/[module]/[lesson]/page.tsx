import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { userHasLessonAccess } from "@/lib/entitlements";
import { Button } from "@/components/ui/button";

async function completeLesson(formData: FormData) {
  "use server";
  const session = await requireUser();
  if (!session) redirect("/login");
  const lessonId = String(formData.get("lessonId") || "");
  const allowed = await userHasLessonAccess(session.id, lessonId);
  if (!allowed) redirect("/app/learn");

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.id, lessonId } },
    create: { userId: session.id, lessonId, percent: 100, completedAt: new Date() },
    update: { percent: 100, completedAt: new Date() },
  });
  redirect("/app/learn");
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}) {
  const session = await requireUser();
  if (!session) return null;
  const { module: moduleSlug, lesson: lessonSlug } = await params;

  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug, module: { slug: moduleSlug } },
    include: { module: true, progress: { where: { userId: session.id } } },
  });
  if (!lesson) notFound();

  const allowed = await userHasLessonAccess(session.id, lesson.id);
  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl text-[var(--navy)]">{lesson.title}</h1>
        <p className="mt-3 text-[var(--steel)]">This lesson is locked until purchased for your enrollment level.</p>
        <Link href="/app/store" className="mt-4 inline-block underline">
          Go to store
        </Link>
      </div>
    );
  }

  const html = lesson.bodyMarkdown
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("- ")) return `<li>${line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li>`;
      if (!line.trim()) return "";
      return `<p>${line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
    })
    .join("\n")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);

  return (
    <article className="mx-auto max-w-3xl animate-rise">
      <p className="text-sm uppercase tracking-wide text-[var(--steel)]">{lesson.module.title}</p>
      <h1 className="mt-1 font-display text-3xl text-[var(--navy)]">{lesson.title}</h1>
      <div className="prose-lesson mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="callout text-sm text-[var(--navy)]">
        Hard rules and exam language appear in bold throughout. Complete the lesson when you are ready, then practice
        with the full exam.
      </div>
      <form action={completeLesson} className="mt-8">
        <input type="hidden" name="lessonId" value={lesson.id} />
        <Button type="submit">
          {lesson.progress[0]?.completedAt ? "Mark complete again" : "Mark lesson complete"}
        </Button>
      </form>
    </article>
  );
}
