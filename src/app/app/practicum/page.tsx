import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { userPracticalCredits } from "@/lib/entitlements";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function requestBooking(formData: FormData) {
  "use server";
  const session = await requireUser();
  if (!session) redirect("/login");
  const sessionId = String(formData.get("sessionId") || "");
  const practicum = await prisma.practicumSession.findUnique({
    where: { id: sessionId },
  });
  if (!practicum) redirect("/app/practicum");

  const credits = await userPracticalCredits(session.id, practicum.practicalSkuId);
  if (credits < 1) redirect("/app/store");

  const modulesDone = await prisma.lessonProgress.count({
    where: { userId: session.id, completedAt: { not: null } },
  });
  const best = await prisma.quizAttempt.findFirst({
    where: { userId: session.id, passed: true },
  });
  // Default gate: modules 1–4 ≈ first 8 lessons completed + practice exam ≥80%
  if (modulesDone < 6 || !best) {
    redirect("/app/practicum?gate=1");
  }

  await prisma.practicumBooking.upsert({
    where: { userId_sessionId: { userId: session.id, sessionId } },
    create: { userId: session.id, sessionId, status: "requested" },
    update: { status: "requested" },
  });

  const credit = await prisma.entitlement.findFirst({
    where: {
      userId: session.id,
      practicalSkuId: practicum.practicalSkuId,
      creditsRemaining: { gt: 0 },
    },
  });
  if (credit) {
    await prisma.entitlement.update({
      where: { id: credit.id },
      data: { creditsRemaining: credit.creditsRemaining - 1 },
    });
  }

  redirect("/app/practicum?requested=1");
}

export default async function PracticumPage({
  searchParams,
}: {
  searchParams: Promise<{ gate?: string; requested?: string }>;
}) {
  const session = await requireUser();
  if (!session) return null;
  const params = await searchParams;

  const skus = await prisma.practicalSku.findMany();
  const credits =
    skus.length > 0 ? await userPracticalCredits(session.id, skus[0].id) : 0;

  const sessions = await prisma.practicumSession.findMany({
    orderBy: { startDate: "asc" },
    include: {
      practicalSku: true,
      bookings: { where: { userId: session.id } },
    },
  });

  const myBookings = await prisma.practicumBooking.findMany({
    where: { userId: session.id },
    include: { session: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Minnesota campus practicum</h1>
      <p className="mt-2 text-[var(--steel)]">
        Schedule practical intensives at Life Star’s Minnesota main campus. You must hold a paid practical credit for
        your level and meet progress gates (modules 1–4 complete + practice exam ≥80%).
      </p>
      <p className="mt-3 text-sm font-medium text-[var(--navy)]">
        Practical credits remaining: {credits}
      </p>
      {credits < 1 && (
        <p className="mt-2 text-sm text-[var(--steel)]">
          <Link href="/app/store" className="underline">
            Purchase a Minnesota practical
          </Link>{" "}
          before requesting a date.
        </p>
      )}
      {params.gate && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Progress gate not met yet — complete early modules and pass the practice exam (≥80%).
        </p>
      )}
      {params.requested && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Date requested — Life Star admin will confirm.
        </p>
      )}

      <section className="mt-8 space-y-3">
        <h2 className="font-display text-xl text-[var(--navy)]">Upcoming intensives</h2>
        {sessions.map((s) => {
          const mine = s.bookings[0];
          return (
            <Card key={s.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[var(--navy)]">{s.title}</p>
                <p className="text-sm text-[var(--steel)]">
                  {s.startDate} → {s.endDate} · {s.practicalSku.locationNote}
                </p>
                {s.notes && <p className="mt-1 text-xs text-[var(--steel)]">{s.notes}</p>}
                {mine && (
                  <p className="mt-1 text-xs capitalize text-emerald-700">Status: {mine.status.replace("_", " ")}</p>
                )}
              </div>
              {!mine && (
                <form action={requestBooking}>
                  <input type="hidden" name="sessionId" value={s.id} />
                  <Button type="submit" disabled={credits < 1}>
                    Request date
                  </Button>
                </form>
              )}
            </Card>
          );
        })}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--navy)]">Your bookings</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {myBookings.length === 0 && <li className="text-[var(--steel)]">No bookings yet.</li>}
          {myBookings.map((b) => (
            <li key={b.id} className="rounded-md bg-white px-4 py-3 ring-1 ring-[var(--navy)]/10">
              {b.session.title} · {b.session.startDate} · <span className="capitalize">{b.status}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-lg bg-[var(--navy)] p-5 text-white">
          <p className="font-display text-lg">Travel checklist</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
            <li>Confirm admin booking status before booking flights</li>
            <li>Bring DL, records, and exported application packet</li>
            <li>Plan for classroom ≤3 hrs/day and BTW ≤2 hrs/day</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
