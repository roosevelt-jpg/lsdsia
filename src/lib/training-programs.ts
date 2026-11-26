/**
 * Canonical Life Star campus training packages (prefs: BTW $7k / Classroom $15k).
 * Package 2 (Classroom) is cumulative — it includes everything in package 1 (BTW).
 */

export type TrainingProgramDef = {
  code: string;
  name: string;
  description: string;
  durationDays: number;
  locationNote: string;
  amountCents: number;
  downPaymentPercent: number;
  installmentMonths: number;
  /** What this package entails (display). */
  features: string[];
  /** Code of a lower package fully included in this one (Classroom → BTW). */
  includesCode: string | null;
};

export const TRAINING_PROGRAMS: TrainingProgramDef[] = [
  {
    code: "btw-training",
    name: "Behind-the-wheel training",
    description:
      "On-campus behind-the-wheel / laboratory training at Life Star’s Minnesota main campus (7411.0630 competencies).",
    durationDays: 5,
    locationNote: "Life Star Driving School — Minnesota main campus",
    amountCents: 700_000,
    downPaymentPercent: 50,
    installmentMonths: 3,
    includesCode: null,
    features: [
      "Minnesota campus behind-the-wheel (laboratory) instruction",
      "7411.0630 competency practice in dual-control vehicles",
      "Life Star Driving School main-campus scheduling",
      "Practicum booking credit in the student portal",
      "Payment plan: 50% down, balance over 3 months",
    ],
  },
  {
    code: "classroom-sessions",
    name: "Classroom sessions",
    description:
      "Full instructor classroom pathway at Life Star’s Minnesota main campus — includes everything in Behind-the-wheel training.",
    durationDays: 10,
    locationNote: "Life Star Driving School — Minnesota main campus",
    amountCents: 1_500_000,
    downPaymentPercent: 50,
    installmentMonths: 5,
    includesCode: "btw-training",
    features: [
      "Everything in Behind-the-wheel training",
      "Instructor classroom theory sessions on campus",
      "Extended Minnesota campus instructional schedule",
      "Combined classroom + laboratory pathway toward licensing readiness",
      "Practicum booking credit covering both classroom and BTW tracks",
      "Payment plan: 50% down, balance over 5 months",
    ],
  },
];

export function trainingProgramByCode(code: string) {
  return TRAINING_PROGRAMS.find((p) => p.code === code) ?? null;
}

/** Resolve display features, preferring DB JSON then canonical defs by code. */
export function resolveProgramFeatures(opts: {
  code?: string | null;
  featuresJson?: string | null;
}): string[] {
  try {
    const parsed = JSON.parse(opts.featuresJson || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((x) => String(x)).filter(Boolean);
    }
  } catch {
    /* ignore */
  }
  if (opts.code) {
    return trainingProgramByCode(opts.code)?.features ?? [];
  }
  return [];
}

export function resolveIncludesLabel(opts: {
  code?: string | null;
  includesCode?: string | null;
}): string | null {
  const code = opts.includesCode ?? (opts.code ? trainingProgramByCode(opts.code)?.includesCode : null);
  if (!code) return null;
  return trainingProgramByCode(code)?.name ?? code;
}
