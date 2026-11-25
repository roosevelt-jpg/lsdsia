import Link from "next/link";
import { redirect } from "next/navigation";
import { Presentation } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function ensureSampleSlides(quizId: string) {
  const marked = await prisma.question.count({ where: { quizId, inAdminSlides: true } });
  if (marked > 0) return;
  const sample = await prisma.question.findMany({
    where: { quizId },
    orderBy: { number: "asc" },
    take: 25,
    select: { id: true },
  });
  if (sample.length === 0) return;
  await prisma.question.updateMany({
    where: { id: { in: sample.map((q) => q.id) } },
    data: { inAdminSlides: true },
  });
}

async function toggleSlide(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  const next = formData.get("inAdminSlides") === "1";
  if (!id) redirect("/admin/quizzes");
  await prisma.question.update({ where: { id }, data: { inAdminSlides: next } });
  redirect("/admin/quizzes");
}

async function setSampleSlides(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const quizId = String(formData.get("quizId") || "");
  const count = Math.min(Math.max(Number(formData.get("count") || 25), 1), 100);
  if (!quizId) redirect("/admin/quizzes");
  await prisma.question.updateMany({ where: { quizId }, data: { inAdminSlides: false } });
  const sample = await prisma.question.findMany({
    where: { quizId },
    orderBy: { number: "asc" },
    take: count,
    select: { id: true },
  });
  await prisma.question.updateMany({
    where: { id: { in: sample.map((q) => q.id) } },
    data: { inAdminSlides: true },
  });
  redirect("/admin/quizzes?ok=1");
}

export default async function AdminQuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireUser(["admin"]);
  const params = await searchParams;
  const quiz = await prisma.quiz.findUnique({
    where: { slug: "instructor-practice-exam" },
    include: {
      _count: { select: { questions: true, attempts: true } },
      questions: { orderBy: { number: "asc" } },
    },
  });

  if (quiz) await ensureSampleSlides(quiz.id);

  const refreshed = quiz
    ? await prisma.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          _count: { select: { questions: true, attempts: true } },
          questions: { orderBy: { number: "asc" } },
        },
      })
    : null;

  const slideCount = refreshed?.questions.filter((q) => q.inAdminSlides).length ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[var(--navy)]">Quizzes</h1>
          <p className="mt-2 text-sm text-[var(--steel)]">
            Candidate exams hide the answer key until after submit. Admin Q&A slides show selected answers for staff
            only.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quiz-slides" className="inline-flex items-center gap-2">
            <Presentation className="h-4 w-4" />
            Open answer slides ({slideCount})
          </Link>
        </Button>
      </div>

      {params.ok && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Slide selection updated.</p>
      )}

      {!refreshed ? (
        <p className="text-[var(--steel)]">No quiz seeded. Run npm run db:seed.</p>
      ) : (
        <>
          <Card>
            <h2 className="font-display text-xl text-[var(--navy)]">{refreshed.title}</h2>
            <p className="mt-1 text-sm text-[var(--steel)]">{refreshed.description}</p>
            <p className="mt-3 text-sm text-[var(--navy)]">
              {refreshed._count.questions} questions · pass {refreshed.passPercent}% · {refreshed._count.attempts}{" "}
              attempts · {slideCount} in admin slides
            </p>
            <form action={setSampleSlides} className="mt-4 flex flex-wrap items-end gap-2">
              <input type="hidden" name="quizId" value={refreshed.id} />
              <div>
                <label className="text-xs text-[var(--steel)]">Reset slides to first N questions</label>
                <input
                  name="count"
                  type="number"
                  defaultValue={25}
                  min={1}
                  max={100}
                  className="mt-1 flex h-10 w-28 rounded-md border border-[var(--navy)]/15 px-3 text-sm"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Apply sample set
              </Button>
            </form>
          </Card>

          <div className="space-y-2">
            <h3 className="font-medium text-[var(--navy)]">Questions — toggle which appear in admin slides</h3>
            {refreshed.questions.map((q) => {
              const choices = q.choicesJson ? (JSON.parse(q.choicesJson) as string[]) : null;
              const answer =
                q.type === "multiple_choice" && q.correctIndex != null && choices
                  ? choices[q.correctIndex]
                  : q.acceptedKeywords
                    ? `Keywords: ${JSON.parse(q.acceptedKeywords).join(", ")}`
                    : null;
              return (
                <Card key={q.id} className="space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[var(--steel)]">
                        Q{q.number} · {q.type} · {q.topic}
                        {q.inAdminSlides ? " · in slides" : ""}
                      </p>
                      <p className="mt-1 text-sm text-[var(--navy)]">{q.prompt}</p>
                      {answer && (
                        <p className="mt-2 text-xs font-semibold text-emerald-800">Answer: {answer}</p>
                      )}
                    </div>
                    <form action={toggleSlide}>
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="inAdminSlides" value={q.inAdminSlides ? "0" : "1"} />
                      <Button type="submit" size="sm" variant={q.inAdminSlides ? "default" : "outline"}>
                        {q.inAdminSlides ? "Remove from slides" : "Add to slides"}
                      </Button>
                    </form>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
