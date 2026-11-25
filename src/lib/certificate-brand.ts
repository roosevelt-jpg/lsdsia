/**
 * Life Star certificate brand + registration constants.
 * Edit SchoolSetting in the DB (seed / future admin settings) for Program Director name
 * and MN registration/license IDs. Owner signatory is fixed product copy.
 */

export const CERTIFICATE_BRAND = {
  schoolName: "Life Star Driving School",
  academyName: "Instructor Academy (LSDS)",
  campusLine: "Minnesota main campus · practical intensives",
  worldwideLine: "Serving graduates worldwide",
  ownerName: "John Addo",
  ownerTitle: "Owner",
  directorTitle: "Program Director",
  /** Fallback when SchoolSetting.programDirectorName is empty */
  defaultDirectorName: "Alex Rivera",
  sealPrimary: "LSDS Authenticated Credential",
  sealSecondary: "Official Digital Certificate",
  /** Override via env PROGRAM_DIRECTOR_NAME when seeding / bootstrapping */
  envDirectorName: process.env.PROGRAM_DIRECTOR_NAME || "",
} as const;

export function resolveDirectorName(fromSettings?: string | null) {
  const trimmed = (fromSettings || "").trim();
  if (trimmed) return trimmed;
  const fromEnv = CERTIFICATE_BRAND.envDirectorName.trim();
  if (fromEnv) return fromEnv;
  return CERTIFICATE_BRAND.defaultDirectorName;
}
