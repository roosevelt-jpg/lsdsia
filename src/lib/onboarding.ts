import { prisma } from "@/lib/db";
import { candidateNeedsIdentityDocs, getIdentityDocStatus } from "@/lib/identity-docs";

export type LicenseStatus = "not_submitted" | "pending" | "approved" | "rejected";

export async function getLicenseVerification(userId: string) {
  return prisma.licenseVerification.findUnique({ where: { userId } });
}

/** Candidates must submit DL + passport photo + travel passport before using the rest of /app. */
export async function candidateNeedsLicenseUpload(userId: string, role: string) {
  return candidateNeedsIdentityDocs(userId, role);
}

export async function ensureLicenseRow(userId: string) {
  return prisma.licenseVerification.upsert({
    where: { userId },
    create: { userId, status: "not_submitted" },
    update: {},
  });
}

export { getIdentityDocStatus };
