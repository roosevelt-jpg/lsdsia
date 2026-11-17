import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";

export default async function AdminQuizzesPage() {
  const quiz = await prisma.quiz.findUnique({
    where: { slug: "instructor-practice-exam" },
    include: {
      _count: { select: { questions: true, attempts: true } },
      questions: { orderBy: { number: "asc" }, take: 15 },
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Quizzes</h1>
      {!quiz ? (
        <p className="mt-4 text-[var(--steel)]">No quiz seeded. Run npm run db:seed.</p>
      ) : (
        <>
          <Card className="mt-6">
            <h2 className="font-display text-xl text-[var(--navy)]">{quiz.title}</h2>
            <p className="mt-1 text-sm text-[var(--steel)]">{quiz.description}</p>
            <p className="mt-3 text-sm text-[var(--navy)]">
              {quiz._count.questions} questions · pass {quiz.passPercent}% · {quiz._count.attempts} attempts
            </p>
          </Card>
          <div className="mt-6 space-y-2">
            <h3 className="font-medium text-[var(--navy)]">Sample questions (first 15)</h3>
            {quiz.questions.map((q) => (
              <Card key={q.id}>
                <p className="text-xs text-[var(--steel)]">
                  Q{q.number} · {q.type} · {q.topic}
                </p>
                <p className="mt-1 text-sm text-[var(--navy)]">{q.prompt}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
