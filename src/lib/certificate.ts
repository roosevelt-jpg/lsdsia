import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { CERTIFICATE_BRAND, resolveDirectorName } from "@/lib/certificate-brand";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(len: number) {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  return out;
}

export async function generateVerificationCode(): Promise<string> {
  for (let i = 0; i < 12; i++) {
    const code = `LSDS-C-${randomCode(8)}`;
    const exists = await prisma.certificate.findUnique({ where: { verificationCode: code } });
    if (!exists) return code;
  }
  return `LSDS-C-${randomCode(10)}`;
}

export type EligibilityResult =
  | {
      ok: true;
      enrollmentId: string;
      completed: boolean;
      hasActiveCertificate: boolean;
    }
  | { ok: false; reason: string };

/** Gate: enrollment + passed practice exam. Does not require completion (admin may complete on issue). */
export async function checkCertificateEligibility(userId: string): Promise<EligibilityResult> {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId },
    orderBy: { startedAt: "desc" },
    include: { certificate: true },
  });
  if (!enrollment) {
    return { ok: false, reason: "Student has no enrollment. Assign a program level first." };
  }

  const hasActiveCertificate = Boolean(enrollment.certificate && !enrollment.certificate.revokedAt);
  if (hasActiveCertificate) {
    return {
      ok: false,
      reason: `A certificate already exists (${enrollment.certificate!.verificationCode}).`,
    };
  }

  const passed = await prisma.quizAttempt.findFirst({
    where: { userId, passed: true, submittedAt: { not: null } },
  });
  if (!passed) {
    return {
      ok: false,
      reason:
        "Student has not passed the practice exam yet (requires a submitted attempt at or above the quiz pass mark, typically 80%).",
    };
  }

  return {
    ok: true,
    enrollmentId: enrollment.id,
    completed: enrollment.status === "completed",
    hasActiveCertificate: false,
  };
}

export type IssueOptions = {
  userId: string;
  issuedById?: string | null;
  /** When true, mark enrollment completed if needed (admin Issue action). */
  completeEnrollment?: boolean;
};

export async function issueCertificate(opts: IssueOptions) {
  const eligibility = await checkCertificateEligibility(opts.userId);
  if (!eligibility.ok) {
    return { ok: false as const, error: eligibility.reason };
  }

  let enrollment = await prisma.enrollment.findUnique({
    where: { id: eligibility.enrollmentId },
    include: { level: true, user: true },
  });
  if (!enrollment) {
    return { ok: false as const, error: "Enrollment not found." };
  }

  if (enrollment.status !== "completed") {
    if (!opts.completeEnrollment) {
      return {
        ok: false as const,
        error:
          "Program is not marked completed yet. Use “Mark program certified” or Issue certificate (completes + issues).",
      };
    }
    enrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "completed", completedAt: enrollment.completedAt ?? new Date() },
      include: { level: true, user: true },
    });
  }

  if (!enrollment.completedAt) {
    enrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { completedAt: new Date() },
      include: { level: true, user: true },
    });
  }

  const settings = await prisma.schoolSetting.findUnique({ where: { id: "default" } });
  const director = resolveDirectorName(settings?.programDirectorName);
  const verificationCode = await generateVerificationCode();

  const cert = await prisma.certificate.create({
    data: {
      verificationCode,
      userId: opts.userId,
      enrollmentId: enrollment.id,
      studentName: enrollment.user.name,
      enrollmentNumber: enrollment.enrollmentNumber,
      programName: enrollment.level.name,
      completedAt: enrollment.completedAt!,
      issuedById: opts.issuedById ?? null,
      ownerSignatory: CERTIFICATE_BRAND.ownerName,
      directorSignatory: director,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: opts.issuedById ?? opts.userId,
      action: opts.issuedById ? "certificate.admin_issued" : "certificate.auto_issued",
      metaJson: JSON.stringify({
        certificateId: cert.id,
        verificationCode: cert.verificationCode,
        userId: opts.userId,
      }),
    },
  });

  return { ok: true as const, certificate: cert };
}

/** Mark enrollment completed, then auto-issue certificate when the student is eligible. */
export async function certifyAndMaybeIssueCertificate(opts: {
  userId: string;
  enrollmentId: string;
  adminId: string;
}) {
  await prisma.enrollment.update({
    where: { id: opts.enrollmentId },
    data: { status: "completed", completedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: opts.adminId,
      action: "admin.certify_enrollment",
      metaJson: JSON.stringify({ userId: opts.userId, enrollmentId: opts.enrollmentId }),
    },
  });

  const issued = await issueCertificate({
    userId: opts.userId,
    issuedById: opts.adminId,
    completeEnrollment: false,
  });

  return { issued };
}

export async function getCertificateForUser(userId: string) {
  return prisma.certificate.findFirst({
    where: { userId, revokedAt: null },
    orderBy: { issuedAt: "desc" },
  });
}

export async function getCertificateByVerificationCode(code: string) {
  const normalized = code.trim().toUpperCase();
  return prisma.certificate.findUnique({
    where: { verificationCode: normalized },
  });
}

export async function getSchoolCertificateMeta() {
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "default" } });
  return {
    schoolName: settings?.name || CERTIFICATE_BRAND.schoolName,
    address: settings?.address || CERTIFICATE_BRAND.campusLine,
    registrationId: settings?.schoolRegistrationId || "LSDS-MN-REG-PENDING",
    operatorLicenseId: settings?.operatorLicenseId || "MN-OP-LICENSE-PENDING",
    directorName: resolveDirectorName(settings?.programDirectorName),
    supportEmail: settings?.supportEmail || "",
  };
}
