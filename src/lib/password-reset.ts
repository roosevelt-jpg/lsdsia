import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Always return a generic success shape to avoid email enumeration; only mint when user exists.
  if (!user) {
    return { ok: true as const, token: null as string | null, userId: null as string | null };
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "auth.password_reset_requested",
      metaJson: JSON.stringify({ email: user.email }),
    },
  });

  return { ok: true as const, token, userId: user.id };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!token || newPassword.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }
  const tokenHash = hashToken(token);
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { ok: false as const, error: "This reset link is invalid or has expired." };
  }

  await prisma.user.update({
    where: { id: row.userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  await prisma.passwordResetToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  await prisma.auditLog.create({
    data: {
      userId: row.userId,
      action: "auth.password_reset_completed",
      metaJson: JSON.stringify({}),
    },
  });
  return { ok: true as const };
}

export function publicOrigin() {
  return (process.env.APP_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
}
