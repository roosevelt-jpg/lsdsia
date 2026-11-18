import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatUsd, paymentPlanSummary } from "@/lib/money";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default async function PricingPage() {
  const [levels, programs] = await Promise.all([
    prisma.enrollmentLevel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        packages: true,
        lessonPrices: true,
      },
    }),
    prisma.practicalSku.findMany({
      include: { prices: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[var(--mist)]">
      <div className="bg-[var(--navy)] pb-24 pt-4 text-white">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-5 pt-24">
          <p className="font-display text-3xl sm:text-5xl">Life Star Driving School</p>
          <h1 className="mt-3 text-xl text-white/85 sm:text-2xl">Training tuition & payment plans</h1>
          <p className="mt-3 max-w-2xl text-white/70">
            Classroom and behind-the-wheel programs use a 50% down payment online; the balance is spread on a Life Star
            payment plan. Currency: USD.
          </p>
        </div>
      </div>

      <section className="mx-auto -mt-12 max-w-6xl px-5 pb-10">
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((sku) => {
            const total = sku.prices[0]?.amountCents ?? 0;
            const plan = paymentPlanSummary(total, sku.downPaymentPercent, sku.installmentMonths);
            return (
              <div key={sku.id} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[var(--navy)]/10">
                <h2 className="font-display text-2xl text-[var(--navy)]">{sku.name}</h2>
                <p className="mt-2 text-sm text-[var(--steel)]">{sku.description}</p>
                <p className="mt-6 font-display text-3xl text-[var(--navy)]">{formatUsd(total)}</p>
                <p className="mt-2 text-sm font-medium text-[var(--navy)]">{plan}</p>
                <p className="mt-1 text-xs text-[var(--steel)]">{sku.locationNote}</p>
                <Button asChild className="mt-6 w-full">
                  <Link href="/signup">Start enrollment</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="font-display text-2xl text-[var(--navy)]">Online enrollment levels</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--steel)]">
          Levels set à la carte online lesson and package prices. Classroom sessions and behind-the-wheel training are
          priced above for every level.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {levels.map((level) => {
            const lessonSample = level.lessonPrices[0]?.amountCents ?? 0;
            const pkg = level.packages[0];
            return (
              <div key={level.id} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[var(--navy)]/10">
                <h3 className="font-display text-xl text-[var(--navy)]">{level.name}</h3>
                <p className="mt-2 text-sm text-[var(--steel)]">{level.description}</p>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--steel)]">Online lesson (each)</dt>
                    <dd className="font-semibold text-[var(--navy)]">{formatUsd(lessonSample)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--steel)]">Online package</dt>
                    <dd className="font-semibold text-[var(--navy)]">
                      {pkg ? formatUsd(pkg.amountCents) : "—"}
                    </dd>
                  </div>
                </dl>
                <Button asChild className="mt-6 w-full" variant="outline">
                  <Link href="/signup">Enroll at {level.name}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
