import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function AppHomePage() {
  const session = await requireUser();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      enrollments: { include: { level: true }, orderBy: { startedAt: "desc" }, take: 1 },
      entitlements: true,
      lessonProgress: true,
      quizAttempts: { where: { submittedAt: { not: null } }, orderBy: { submittedAt: "desc" }, take: 5 },
      applicationPacket: true,
      orders: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  const enrollment = user?.enrollments[0];
  const lessonEntitlements = user?.entitlements.filter((e) => e.lessonId) ?? [];
  const practicalCredits =
    user?.entitlements
      .filter((e) => e.practicalSkuId)
      .reduce((s, e) => s + e.creditsRemaining, 0) ?? 0;
  const completedLessons = user?.lessonProgress.filter((p) => p.completedAt).length ?? 0;
  const bestQuiz = user?.quizAttempts.reduce(
    (best, a) => Math.max(best, a.scorePercent ?? 0),
    0
  );
  const appPct = user?.applicationPacket?.completenessPercent ?? 0;

  let nextAction = { label: "Choose an enrollment level", href: "/app/enroll" };
  if (!enrollment) {
    nextAction = { label: "Choose an enrollment level", href: "/app/enroll" };
  } else if (lessonEntitlements.length === 0) {
    nextAction = { label: "Buy your first online lesson or package", href: "/app/store" };
  } else if (completedLessons < lessonEntitlements.length) {
    nextAction = { label: "Continue learning", href: "/app/learn" };
  } else if ((bestQuiz ?? 0) < 80) {
    nextAction = { label: "Take the practice exam", href: "/app/quiz" };
  } else if (appPct < 80) {
    nextAction = { label: "Complete your application packet", href: "/app/application" };
  } else if (practicalCredits < 1) {
    nextAction = { label: "Purchase Minnesota practical credit", href: "/app/store" };
  } else {
    nextAction = { label: "Request a campus practicum date", href: "/app/practicum" };
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade">
      <h1 className="font-display text-3xl text-[var(--navy)]">Candidate dashboard</h1>
      <p className="mt-2 text-[var(--steel)]">
        Welcome back, {session.name}. Track your Life Star Instructor Academy progress.
      </p>

      <Card className="mt-8 border-[var(--amber)]/40 bg-[var(--navy)] text-white">
        <p className="text-sm uppercase tracking-wide text-[var(--amber)]">Next action</p>
        <p className="mt-2 font-display text-2xl">{nextAction.label}</p>
        <Button asChild className="mt-4" variant="default">
          <Link href={nextAction.href}>Continue</Link>
        </Button>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-[var(--steel)]">Enrollment level</p>
          <p className="mt-1 font-display text-xl text-[var(--navy)]">
            {enrollment?.level.name ?? "Not enrolled"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">Unlocked lessons</p>
          <p className="mt-1 font-display text-xl text-[var(--navy)]">
            {lessonEntitlements.length} · {completedLessons} completed
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">Best practice exam</p>
          <p className="mt-1 font-display text-xl text-[var(--navy)]">
            {bestQuiz != null && user?.quizAttempts.length ? `${bestQuiz}%` : "Not attempted"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">Application · MN practical credits</p>
          <p className="mt-1 font-display text-xl text-[var(--navy)]">
            {appPct}% · {practicalCredits} credit{practicalCredits === 1 ? "" : "s"}
          </p>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--navy)]">Recent orders</h2>
        <ul className="mt-3 space-y-2">
          {(user?.orders.length ?? 0) === 0 && (
            <li className="text-sm text-[var(--steel)]">No orders yet. Visit the store to purchase.</li>
          )}
          {user?.orders.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between rounded-md bg-white px-4 py-3 text-sm ring-1 ring-[var(--navy)]/10"
            >
              <span className="capitalize text-[var(--navy)]">{o.status}</span>
              <span className="text-[var(--steel)]">{formatUsd(o.totalCents)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
