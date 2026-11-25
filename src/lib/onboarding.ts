import { prisma } from "@/lib/db";

export type LicenseStatus = "not_submitted" | "pending" | "approved" | "rejected";

export async function getLicenseVerification(userId: string) {
  return prisma.licenseVerification.findUnique({ where: { userId } });
}

/** Candidates must at least submit a license upload before using the rest of /app. */
export async function candidateNeedsLicenseUpload(userId: string, role: string) {
  if (role !== "candidate") return false;
  const row = await getLicenseVerification(userId);
  if (!row) return true;
  return row.status === "not_submitted";
}

export async function ensureLicenseRow(userId: string) {
  return prisma.licenseVerification.upsert({
    where: { userId },
    create: { userId, status: "not_submitted" },
    update: {},
  });
}
