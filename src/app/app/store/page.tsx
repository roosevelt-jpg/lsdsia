import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { paymentsMessage, stripeConfigured } from "@/lib/stripe";
import { BuyButton } from "@/components/buy-button";
import { Card } from "@/components/ui/card";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.id, status: "active" },
    include: { level: true },
  });

  if (!enrollment) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl text-[var(--navy)]">Store</h1>
        <p className="mt-3 text-[var(--steel)]">
          Choose an enrollment level before purchasing.{" "}
          <Link href="/app/enroll" className="underline">
            Enroll now
          </Link>
        </p>
      </div>
    );
  }

  const [lessons, packages, practicals, entitlements] = await Promise.all([
    prisma.lesson.findMany({
      include: { module: true, prices: { where: { levelId: enrollment.levelId } } },
      orderBy: [{ module: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    }),
    prisma.levelPackage.findMany({ where: { levelId: enrollment.levelId } }),
    prisma.practicalSku.findMany({
      include: { prices: { where: { levelId: enrollment.levelId } } },
    }),
    prisma.entitlement.findMany({ where: { userId: session.id } }),
  ]);

  const ownedLessons = new Set(entitlements.filter((e) => e.lessonId).map((e) => e.lessonId!));
  const configured = stripeConfigured();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Store</h1>
      <p className="mt-2 text-[var(--steel)]">
        Prices for <strong>{enrollment.level.name}</strong>. Pay online via Stripe Checkout when configured.
      </p>
      {!configured && (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-950">{paymentsMessage()}</p>
      )}
      {params.canceled && (
        <p className="mt-4 rounded-md bg-slate-100 px-4 py-3 text-sm text-[var(--navy)]">Checkout canceled.</p>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--navy)]">Level packages</h2>
        <div className="mt-3 space-y-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[var(--navy)]">{pkg.name}</p>
                <p className="text-sm text-[var(--steel)]">{pkg.description}</p>
                <p className="mt-1 font-semibold">{formatUsd(pkg.amountCents)}</p>
              </div>
              <BuyButton
                type="package"
                id={pkg.id}
                label={`Buy package — ${enrollment.level.name}: ${formatUsd(pkg.amountCents)}`}
                disabled={!configured}
              />
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--navy)]">Minnesota campus practicals</h2>
        <div className="mt-3 space-y-3">
          {practicals.map((sku) => {
            const price = sku.prices[0]?.amountCents ?? 0;
            return (
              <Card key={sku.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[var(--navy)]">{sku.name}</p>
                  <p className="text-sm text-[var(--steel)]">{sku.description}</p>
                  <p className="mt-1 text-sm text-[var(--steel)]">{sku.locationNote}</p>
                  <p className="mt-1 font-semibold">
                    Campus practical — {enrollment.level.name}: {formatUsd(price)}
                  </p>
                </div>
                <BuyButton
                  type="practical"
                  id={sku.id}
                  label={`Buy practical — ${formatUsd(price)}`}
                  disabled={!configured}
                />
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--navy)]">À la carte online lessons</h2>
        <div className="mt-3 space-y-3">
          {lessons.map((lesson) => {
            const price = lesson.prices[0]?.amountCents ?? 0;
            const owned = ownedLessons.has(lesson.id);
            return (
              <Card key={lesson.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--steel)]">{lesson.module.title}</p>
                  <p className="font-medium text-[var(--navy)]">{lesson.title}</p>
                  <p className="mt-1 font-semibold">
                    Online lesson — {enrollment.level.name}: {formatUsd(price)}
                  </p>
                </div>
                {owned ? (
                  <span className="text-sm font-medium text-emerald-700">Unlocked</span>
                ) : (
                  <BuyButton
                    type="lesson"
                    id={lesson.id}
                    label={`Buy — ${formatUsd(price)}`}
                    disabled={!configured}
                  />
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
