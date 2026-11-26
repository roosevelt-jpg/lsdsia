export const APPLICATION_DOC_KINDS = [
  {
    kind: "out_of_state_dl",
    label: "Certified out-of-state driver’s license record",
    hint: "Required if you hold/held a non-Minnesota license",
  },
  {
    kind: "diploma_ged",
    label: "High school diploma or GED",
    hint: "Initial application only",
  },
  {
    kind: "fingerprint_card",
    label: "Fingerprint card / BCA fee receipt",
    hint: "Initial application only — fee payable to BCA",
  },
] as const;

export type ApplicationDocKind = (typeof APPLICATION_DOC_KINDS)[number]["kind"];

export type PacketLike = {
  lastName: string | null;
  firstName: string | null;
  middleName?: string | null;
  fullName: string | null;
  birthDate: string | null;
  address1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  dlNumber: string | null;
  ssnLast4: string | null;
  phone: string | null;
  employingSchoolName: string | null;
  educationProvider: string | null;
  classroomCompetencyDate: string | null;
  laboratoryCompetencyDate: string | null;
  applicantCertified: boolean;
  privacyAcknowledged: boolean;
  applicantSignature: string | null;
  applicantSignedAt: string | null;
};

const STRING_FIELDS: (keyof PacketLike)[] = [
  "lastName",
  "firstName",
  "birthDate",
  "address1",
  "city",
  "state",
  "zip",
  "dlNumber",
  "ssnLast4",
  "phone",
  "employingSchoolName",
  "educationProvider",
  "classroomCompetencyDate",
  "laboratoryCompetencyDate",
  "applicantSignature",
  "applicantSignedAt",
];

export function composeFullName(opts: {
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  fullName?: string | null;
}) {
  const parts = [opts.firstName, opts.middleName, opts.lastName].map((p) => (p || "").trim()).filter(Boolean);
  if (parts.length) return parts.join(" ");
  return (opts.fullName || "").trim() || null;
}

export function computeCompleteness(packet: PacketLike) {
  let filled = 0;
  for (const key of STRING_FIELDS) {
    const v = packet[key];
    if (typeof v === "string" && v.trim()) filled += 1;
  }
  if (packet.applicantCertified) filled += 1;
  if (packet.privacyAcknowledged) filled += 1;
  const total = STRING_FIELDS.length + 2;
  return Math.round((filled / total) * 100);
}

export function extractSsnLast4(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 4) return "";
  return digits.slice(-4);
}
