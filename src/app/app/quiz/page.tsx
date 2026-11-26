import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function startAttempt() {
  "use server";
  const session = await requireUser();
  const quiz = await prisma.quiz.findUnique({ where: { slug: "instructor-practice-exam" } });
  if (!quiz) redirect("/app/quiz");
  const attempt = await prisma.quizAttempt.create({
    data: { userId: session.id, quizId: quiz.id },
  });
  redirect(`/app/quiz/attempt/${attempt.id}`);
}

export default async function QuizHubPage() {
  const session = await requireUser();

  const quiz = await prisma.quiz.findUnique({
    where: { slug: "instructor-practice-exam" },
    include: {
      _count: { select: { questions: true } },
      attempts: {
        where: { userId: session.id },
        orderBy: { startedAt: "desc" },
        take: 10,
      },
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Practice exam</h1>
      <p className="mt-2 text-[var(--steel)]">
        {quiz?.description ?? "Practice exam"} Pass mark {quiz?.passPercent ?? 80}%. Hard timer{" "}
        {quiz?.timeLimitMinutes ?? 240} minutes (auto-submits). About {quiz?._count.questions ?? 0} questions.
      </p>
      <form action={startAttempt} className="mt-6">
        <Button type="submit" size="lg">
          Start new attempt
        </Button>
      </form>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--navy)]">Your attempts</h2>
        <div className="mt-3 space-y-2">
          {(quiz?.attempts.length ?? 0) === 0 && (
            <p className="text-sm text-[var(--steel)]">No attempts yet.</p>
          )}
          {quiz?.attempts.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--navy)]">
                  {a.submittedAt
                    ? `Score ${a.scorePercent}% · ${a.passed ? "Passed" : "Not passed"}`
                    : "In progress"}
                </p>
                <p className="text-xs text-[var(--steel)]">{a.startedAt.toLocaleString()}</p>
              </div>
              <Link href={`/app/quiz/attempt/${a.id}`} className="text-sm underline">
                {a.submittedAt ? "Review" : "Continue"}
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
