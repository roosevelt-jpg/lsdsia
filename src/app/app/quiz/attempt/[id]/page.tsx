import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreResponse } from "@/lib/quiz-score";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function submitAttempt(formData: FormData) {
  "use server";
  const session = await requireUser();
  const attemptId = String(formData.get("attemptId") || "");
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { questions: true } } },
  });
  if (!attempt || attempt.userId !== session.id) redirect("/app/quiz");
  if (attempt.submittedAt) redirect(`/app/quiz/attempt/${attempt.id}`);

  const limitMinutes = attempt.quiz.timeLimitMinutes ?? 240;
  const deadline = attempt.startedAt.getTime() + limitMinutes * 60_000;
  const timedOut = Date.now() > deadline + 5_000; // small grace for clock skew

  let correct = 0;
  for (const q of attempt.quiz.questions) {
    const response = String(formData.get(`q_${q.id}`) || "");
    const isCorrect = scoreResponse(q.type, response, q.correctIndex, q.acceptedKeywords);
    if (isCorrect) correct += 1;
    await prisma.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId: q.id } },
      create: { attemptId, questionId: q.id, response, isCorrect },
      update: { response, isCorrect },
    });
  }

  const scorePercent = Math.round((correct / attempt.quiz.questions.length) * 100);
  const passed = scorePercent >= attempt.quiz.passPercent;
  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { submittedAt: new Date(), scorePercent, passed },
  });
  redirect(`/app/quiz/attempt/${attemptId}${timedOut ? "?timeout=1" : ""}`);
}

export default async function AttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ timeout?: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const sp = await searchParams;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id },
    include: {
      quiz: { include: { questions: { orderBy: { number: "asc" } } } },
      answers: true,
    },
  });
  if (!attempt || attempt.userId !== session.id) notFound();

  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const review = Boolean(attempt.submittedAt);
  const formId = "quiz-attempt-form";

  // If still open but past limit, force submit path via empty form on next interaction;
  // client timer handles auto-submit while the page is open.
  const limitMinutes = attempt.quiz.timeLimitMinutes ?? 240;
  const expired = !review && Date.now() > attempt.startedAt.getTime() + limitMinutes * 60_000;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">{attempt.quiz.title}</h1>
      {review ? (
        <p className="mt-2 text-[var(--steel)]">
          Score <strong>{attempt.scorePercent}%</strong> — {attempt.passed ? "Passed (≥80%)" : "Below pass mark"}.
          Review mode shows correct answers from the Q&A key.
          {sp.timeout ? " Submitted automatically when time expired." : ""}
        </p>
      ) : (
        <>
          <p className="mt-2 text-[var(--steel)]">
            Hard time limit: {limitMinutes} minutes. Unanswered items score as incorrect when time expires.
          </p>
          <QuizTimer
            startedAtIso={attempt.startedAt.toISOString()}
            limitMinutes={limitMinutes}
            formId={formId}
          />
          {expired && (
            <p className="mt-2 text-sm font-semibold text-red-700">
              Time has expired — submit now to record your score.
            </p>
          )}
        </>
      )}

      <form id={formId} action={submitAttempt} className="mt-8 space-y-6">
        <input type="hidden" name="attemptId" value={attempt.id} />
        {attempt.quiz.questions.map((q) => {
          const choices = q.choicesJson ? (JSON.parse(q.choicesJson) as string[]) : null;
          const ans = answerMap.get(q.id);
          return (
            <Card key={q.id}>
              <p className="text-xs uppercase tracking-wide text-[var(--steel)]">
                Q{q.number} · {q.topic}
              </p>
              <p className="mt-2 font-medium text-[var(--navy)]">{q.prompt}</p>
              {choices ? (
                <div className="mt-3 space-y-2">
                  {choices.map((c, idx) => (
                    <label key={idx} className="flex items-start gap-2 text-sm text-[var(--steel)]">
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value={idx}
                        disabled={review}
                        defaultChecked={ans ? ans.response === String(idx) : false}
                        className="mt-1"
                      />
                      <span>
                        {c}
                        {review && q.correctIndex === idx ? " ✓" : ""}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  name={`q_${q.id}`}
                  disabled={review}
                  defaultValue={ans?.response ?? ""}
                  className="mt-3 w-full rounded-md border border-[var(--navy)]/15 p-3 text-sm"
                  rows={3}
                  placeholder="Short answer — include key terms"
                />
              )}
              {review && (
                <div className="mt-3 rounded-md bg-[var(--mist)] p-3 text-sm text-[var(--navy)]">
                  <p className={ans?.isCorrect ? "text-emerald-700" : "text-red-700"}>
                    {ans?.isCorrect ? "Correct" : "Incorrect"}
                  </p>
                  <p className="mt-1">{q.explanation}</p>
                </div>
              )}
            </Card>
          );
        })}
        {!review && (
          <Button type="submit" size="lg">
            Submit exam
          </Button>
        )}
      </form>
    </div>
  );
}
