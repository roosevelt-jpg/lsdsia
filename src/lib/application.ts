type PacketLike = {
  fullName: string | null;
  birthDate: string | null;
  address1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  dlNumber: string | null;
  phone: string | null;
  employingSchoolName: string | null;
  educationProvider: string | null;
  classroomCompetencyDate: string | null;
  laboratoryCompetencyDate: string | null;
  applicantCertified: boolean;
  privacyAcknowledged: boolean;
};

const FIELDS: (keyof PacketLike)[] = [
  "fullName",
  "birthDate",
  "address1",
  "city",
  "state",
  "zip",
  "dlNumber",
  "phone",
  "employingSchoolName",
  "educationProvider",
  "classroomCompetencyDate",
  "laboratoryCompetencyDate",
];

export function computeCompleteness(packet: PacketLike) {
  let filled = 0;
  for (const key of FIELDS) {
    const v = packet[key];
    if (typeof v === "string" && v.trim()) filled += 1;
  }
  if (packet.applicantCertified) filled += 1;
  if (packet.privacyAcknowledged) filled += 1;
  const total = FIELDS.length + 2;
  return Math.round((filled / total) * 100);
}
