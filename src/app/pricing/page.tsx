import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default async function PricingPage() {
  const levels = await prisma.enrollmentLevel.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      packages: true,
      lessonPrices: true,
      practicalPrices: { include: { practicalSku: true } },
    },
  });

  return (
    <main className="min-h-screen bg-[var(--mist)]">
      <div className="bg-[var(--navy)] pb-24 pt-4 text-white">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-5 pt-24">
          <p className="font-display text-3xl sm:text-5xl">Life Star Driving School</p>
          <h1 className="mt-3 text-xl text-white/85 sm:text-2xl">Enrollment levels & pricing</h1>
          <p className="mt-3 max-w-2xl text-white/70">
            Choose a level. Online lessons and Minnesota campus practicals are priced for that level. Currency: USD.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-12 grid max-w-6xl gap-6 px-5 pb-20 md:grid-cols-3">
        {levels.map((level) => {
          const lessonSample = level.lessonPrices[0]?.amountCents ?? 0;
          const pkg = level.packages[0];
          const practical = level.practicalPrices[0];
          return (
            <div key={level.id} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[var(--navy)]/10">
              <h2 className="font-display text-2xl text-[var(--navy)]">{level.name}</h2>
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
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--steel)]">MN practical</dt>
                  <dd className="font-semibold text-[var(--navy)]">
                    {practical ? formatUsd(practical.amountCents) : "—"}
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
    </main>
  );
}
