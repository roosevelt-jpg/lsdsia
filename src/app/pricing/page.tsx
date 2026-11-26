import Link from "next/link";
import { Check } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatUsd, paymentPlanSummary } from "@/lib/money";
import { loadCmsBundle } from "@/lib/cms";
import {
  TRAINING_PROGRAMS,
  resolveIncludesLabel,
  resolveProgramFeatures,
} from "@/lib/training-programs";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type ProgramCard = {
  id: string;
  code: string;
  name: string;
  description: string;
  locationNote: string;
  amountCents: number;
  downPaymentPercent: number;
  installmentMonths: number;
  features: string[];
  includesLabel: string | null;
};

type LevelCard = {
  id: string;
  name: string;
  description: string;
  lessonCents: number;
  packageCents: number | null;
};

function fallbackPrograms(): ProgramCard[] {
  return TRAINING_PROGRAMS.map((p) => ({
    id: p.code,
    code: p.code,
    name: p.name,
    description: p.description,
    locationNote: p.locationNote,
    amountCents: p.amountCents,
    downPaymentPercent: p.downPaymentPercent,
    installmentMonths: p.installmentMonths,
    features: p.features,
    includesLabel: resolveIncludesLabel({ code: p.code }),
  }));
}

export default async function PricingPage() {
  let levels: LevelCard[] = [];
  let programs: ProgramCard[] = [];

  try {
    const [levelRows, skuRows] = await Promise.all([
      prisma.enrollmentLevel.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          packages: true,
          lessonPrices: true,
        },
      }),
      prisma.practicalSku.findMany({
        include: { prices: true, includesSku: true },
        orderBy: { name: "asc" },
      }),
    ]);
    levels = levelRows.map((level) => ({
      id: level.id,
      name: level.name,
      description: level.description,
      lessonCents: level.lessonPrices[0]?.amountCents ?? 0,
      packageCents: level.packages[0]?.amountCents ?? null,
    }));
    programs = skuRows
      .map((sku) => ({
        id: sku.id,
        code: sku.code,
        name: sku.name,
        description: sku.description,
        locationNote: sku.locationNote,
        amountCents: sku.prices[0]?.amountCents ?? 0,
        downPaymentPercent: sku.downPaymentPercent,
        installmentMonths: sku.installmentMonths,
        features: resolveProgramFeatures({ code: sku.code, featuresJson: sku.featuresJson }),
        includesLabel:
          sku.includesSku?.name ||
          resolveIncludesLabel({ code: sku.code, includesCode: sku.includesSku?.code }),
      }))
      // Prefer canonical order: BTW first, Classroom second.
      .sort((a, b) => {
        const order = TRAINING_PROGRAMS.map((p) => p.code);
        return (order.indexOf(a.code) + 99) - (order.indexOf(b.code) + 99);
      });
  } catch {
    programs = [];
    levels = [];
  }

  if (programs.length === 0) {
    programs = fallbackPrograms();
  }

  const { site, nav } = await loadCmsBundle();

  return (
    <main className="min-h-screen bg-[var(--mist)] font-[family-name:var(--font-marketing)]">
      <MarketingHeader site={site} nav={nav} />
      <div className="bg-[var(--navy)] pb-24 pt-10 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-3xl font-bold sm:text-5xl">Life Star Driving School</p>
          <h1 className="mt-3 text-xl text-white/85 sm:text-2xl">Training tuition & payment plans</h1>
          <p className="mt-3 max-w-2xl text-white/70">
            Classroom and behind-the-wheel programs use a 50% down payment online; the balance is spread on a Life Star
            payment plan. The Classroom package includes everything in Behind-the-wheel training. Currency: USD. Owner:
            John Addo.
          </p>
        </div>
      </div>

      <section className="mx-auto -mt-12 max-w-6xl px-5 pb-10">
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((sku) => {
            const plan = paymentPlanSummary(sku.amountCents, sku.downPaymentPercent, sku.installmentMonths);
            return (
              <div key={sku.id} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[var(--navy)]/10">
                <h2 className="font-display text-2xl text-[var(--navy)]">{sku.name}</h2>
                <p className="mt-2 text-sm text-[var(--steel)]">{sku.description}</p>
                {sku.includesLabel ? (
                  <p className="mt-3 rounded-md bg-[var(--navy)]/5 px-3 py-2 text-xs font-semibold text-[var(--navy)]">
                    Includes full {sku.includesLabel} package
                  </p>
                ) : null}
                <p className="mt-6 font-display text-3xl text-[var(--navy)]">{formatUsd(sku.amountCents)}</p>
                <p className="mt-2 text-sm font-medium text-[var(--navy)]">{plan}</p>
                <p className="mt-1 text-xs text-[var(--steel)]">{sku.locationNote}</p>

                {sku.features.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--steel)]">
                      What this package entails
                    </p>
                    <ul className="mt-3 space-y-2">
                      {sku.features.map((feature) => (
                        <li key={feature} className="flex gap-2 text-sm text-[var(--navy)]">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]" aria-hidden />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Button asChild className="mt-6 w-full">
                  <Link href="/signup">Start enrollment</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {levels.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="font-display text-2xl text-[var(--navy)]">Online enrollment levels</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--steel)]">
            Levels set à la carte online lesson and package prices. Classroom sessions and behind-the-wheel training are
            priced above for every level.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {levels.map((level) => (
              <div key={level.id} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[var(--navy)]/10">
                <h3 className="font-display text-xl text-[var(--navy)]">{level.name}</h3>
                <p className="mt-2 text-sm text-[var(--steel)]">{level.description}</p>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--steel)]">Online lesson (each)</dt>
                    <dd className="font-semibold text-[var(--navy)]">{formatUsd(level.lessonCents)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--steel)]">Online package</dt>
                    <dd className="font-semibold text-[var(--navy)]">
                      {level.packageCents != null ? formatUsd(level.packageCents) : "—"}
                    </dd>
                  </div>
                </dl>
                <Button asChild className="mt-6 w-full" variant="outline">
                  <Link href="/signup">Enroll at {level.name}</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
      <MarketingFooter site={site} nav={nav} />
    </main>
  );
}
