import { prisma } from "@/lib/db";
import { savePrivateUpload } from "@/lib/private-uploads";

async function ensureLicenseRow(userId: string) {
  const existing = await prisma.licenseVerification.findUnique({ where: { userId } });
  if (existing) return existing;
  // Guard: never create a license row for a user id that no longer exists
  // (stale JWT after SQLite redeploy) — callers should have already bounced via requireUser.
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    throw new Error(`Cannot create license verification for unknown user ${userId}`);
  }
  return prisma.licenseVerification.create({
    data: { userId, status: "not_submitted" },
  });
}

export type IdentityDocStatus = {
  hasLicense: boolean;
  hasPassportPhoto: boolean;
  hasTravelPassport: boolean;
  complete: boolean;
  status: string;
};

export async function getIdentityDocStatus(userId: string): Promise<IdentityDocStatus> {
  const row = await ensureLicenseRow(userId);
  const hasLicense = Boolean(row.uploadId);
  const hasPassportPhoto = Boolean(row.passportPhotoUploadId);
  const hasTravelPassport = Boolean(row.travelPassportUploadId);
  return {
    hasLicense,
    hasPassportPhoto,
    hasTravelPassport,
    complete: hasLicense && hasPassportPhoto && hasTravelPassport,
    status: row.status,
  };
}

/** Candidates must submit DL + passport photo + travel passport before using /app. */
export async function candidateNeedsIdentityDocs(userId: string, role: string) {
  if (role !== "candidate") return false;
  const status = await getIdentityDocStatus(userId);
  return !status.complete;
}

export async function saveIdentityDocuments(opts: {
  userId: string;
  actorId: string;
  formData: FormData;
  requireAll?: boolean;
}) {
  const { userId, actorId, formData, requireAll = true } = opts;
  const licenseNumber = String(formData.get("licenseNumber") || "").trim() || null;
  const licenseState = String(formData.get("licenseState") || "").trim() || null;
  const passportNumber = String(formData.get("passportNumber") || "").trim() || null;

  const licenseFile = formData.get("licenseFile");
  const passportPhotoFile = formData.get("passportPhotoFile");
  const travelPassportFile = formData.get("travelPassportFile");

  const row = await ensureLicenseRow(userId);
  const updates: {
    licenseNumber: string | null;
    licenseState: string | null;
    passportNumber: string | null;
    uploadId?: string;
    passportPhotoUploadId?: string;
    travelPassportUploadId?: string;
    status?: string;
    submittedAt?: Date;
    adminNote?: null;
    reviewedAt?: null;
    reviewedById?: null;
  } = {
    licenseNumber,
    licenseState,
    passportNumber,
  };

  if (licenseFile instanceof File && licenseFile.size > 0) {
    const upload = await savePrivateUpload({ userId, kind: "drivers_license", file: licenseFile });
    updates.uploadId = upload.id;
  }
  if (passportPhotoFile instanceof File && passportPhotoFile.size > 0) {
    const upload = await savePrivateUpload({ userId, kind: "passport_photo", file: passportPhotoFile });
    updates.passportPhotoUploadId = upload.id;
    // Keep student ID photo in sync with passport-style headshot when provided.
    await prisma.profile.upsert({
      where: { userId },
      create: { userId, idPhotoUploadId: upload.id },
      update: { idPhotoUploadId: upload.id },
    });
  }
  if (travelPassportFile instanceof File && travelPassportFile.size > 0) {
    const upload = await savePrivateUpload({ userId, kind: "travel_passport", file: travelPassportFile });
    updates.travelPassportUploadId = upload.id;
  }

  const nextUploadId = updates.uploadId ?? row.uploadId;
  const nextPassport = updates.passportPhotoUploadId ?? row.passportPhotoUploadId;
  const nextTravel = updates.travelPassportUploadId ?? row.travelPassportUploadId;

  if (requireAll && (!nextUploadId || !nextPassport || !nextTravel)) {
    throw new Error("Upload your driver’s license, passport-style photo, and travel passport copy.");
  }

  const allPresent = Boolean(nextUploadId && nextPassport && nextTravel);
  if (allPresent) {
    updates.status = "pending";
    updates.submittedAt = new Date();
    updates.adminNote = null;
    updates.reviewedAt = null;
    updates.reviewedById = null;
  }

  await prisma.licenseVerification.update({
    where: { userId },
    data: updates,
  });

  await prisma.auditLog.create({
    data: {
      userId: actorId,
      action: "onboarding.identity_docs_submitted",
      metaJson: JSON.stringify({
        userId,
        hasLicense: Boolean(nextUploadId),
        hasPassportPhoto: Boolean(nextPassport),
        hasTravelPassport: Boolean(nextTravel),
      }),
    },
  });

  return { complete: allPresent };
}
