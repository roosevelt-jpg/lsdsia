import Link from "next/link";
import { Shield } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { QaSlides, type QaSlide } from "@/components/admin/qa-slides";

export const dynamic = "force-dynamic";

export default async function AdminQuizSlidesPage() {
  // Admin layout already gates, but keep an explicit check so this never leaks.
  await requireUser(["admin"]);

  const quiz = await prisma.quiz.findUnique({
    where: { slug: "instructor-practice-exam" },
    include: {
      questions: {
        where: { inAdminSlides: true },
        orderBy: { number: "asc" },
      },
    },
  });

  const slides: QaSlide[] = (quiz?.questions || []).map((q) => ({
    id: q.id,
    number: q.number,
    prompt: q.prompt,
    type: q.type,
    topic: q.topic,
    choices: q.choicesJson ? (JSON.parse(q.choicesJson) as string[]) : null,
    correctIndex: q.correctIndex,
    acceptedKeywords: q.acceptedKeywords ? (JSON.parse(q.acceptedKeywords) as string[]) : null,
    explanation: q.explanation,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
          <Shield className="h-4 w-4" />
          Admin only — answer key slideshow is never shown to candidates
        </p>
        <h1 className="mt-2 font-display text-3xl text-[var(--navy)]">Q&A answer slides</h1>
        <p className="mt-2 text-sm text-[var(--steel)]">
          Curated practice questions with correct answers and explanations for staff review. Manage which items appear
          from{" "}
          <Link href="/admin/quizzes" className="font-semibold text-[#2b6cb0] underline">
            Quizzes
          </Link>
          .
        </p>
      </div>

      <QaSlides slides={slides} quizTitle={quiz?.title || "Practice exam"} />
    </div>
  );
}
