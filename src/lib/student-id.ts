import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1

function randomSuffix(len = 6): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

/** Generate a unique human-readable enrollment number: LS-YYYY-XXXXXX */
export async function generateEnrollmentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = `LS-${year}-${randomSuffix(6)}`;
    const exists = await prisma.enrollment.findUnique({ where: { enrollmentNumber: candidate } });
    if (!exists) return candidate;
  }
  return `LS-${year}-${randomSuffix(8)}`;
}

export async function loadStudentIdPayload(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      enrollments: {
        include: { level: true },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });
  if (!user) return null;

  const enrollment = user.enrollments[0] ?? null;
  return { user, enrollment, profile: user.profile };
}
