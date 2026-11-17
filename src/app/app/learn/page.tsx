import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { Card } from "@/components/ui/card";

export default async function LearnPage() {
  const session = await requireUser();
  if (!session) return null;

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.id, status: "active" },
    include: { level: true },
  });

  const modules = await prisma.module.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      lessons: {
        orderBy: { sortOrder: "asc" },
        include: {
          prices: enrollment ? { where: { levelId: enrollment.levelId } } : false,
          progress: { where: { userId: session.id } },
        },
      },
    },
  });

  const entitlements = await prisma.entitlement.findMany({
    where: { userId: session.id, lessonId: { not: null } },
  });
  const unlocked = new Set(entitlements.map((e) => e.lessonId!));
  const isStaff = session.role === "admin" || session.role === "coach";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Learn</h1>
      <p className="mt-2 text-[var(--steel)]">
        Online knowledge track. Locked lessons show your level price until purchased.
      </p>
      <div className="mt-8 space-y-8">
        {modules.map((mod) => (
          <section key={mod.id}>
            <h2 className="font-display text-xl text-[var(--navy)]">{mod.title}</h2>
            <p className="mt-1 text-sm text-[var(--steel)]">{mod.description}</p>
            <div className="mt-4 space-y-3">
              {mod.lessons.map((lesson) => {
                const open = isStaff || unlocked.has(lesson.id);
                const price = lesson.prices?.[0]?.amountCents;
                const done = lesson.progress[0]?.completedAt;
                return (
                  <Card key={lesson.id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-[var(--navy)]">{lesson.title}</p>
                      <p className="text-sm text-[var(--steel)]">{lesson.summary}</p>
                      {!open && price != null && enrollment && (
                        <p className="mt-1 text-xs text-[var(--steel)]">
                          Online lesson — {enrollment.level.name}: {formatUsd(price)} · locked
                        </p>
                      )}
                      {done && <p className="mt-1 text-xs text-emerald-700">Completed</p>}
                    </div>
                    {open ? (
                      <Link
                        href={`/app/learn/${mod.slug}/${lesson.slug}`}
                        className="text-sm font-medium text-[var(--navy)] underline"
                      >
                        Open
                      </Link>
                    ) : (
                      <Link href="/app/store" className="text-sm font-medium text-[var(--amber)]">
                        Unlock
                      </Link>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
