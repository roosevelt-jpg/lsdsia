import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateEnrollmentNumber } from "@/lib/student-id";
import { AuthShell } from "@/components/auth/auth-shell";
import { RolePicker } from "@/components/auth/role-picker";

async function saveRole(formData: FormData) {
  "use server";
  const session = await requireUser();
  const role = String(formData.get("role") || "candidate");
  const inviteCode = String(formData.get("inviteCode") || "").trim();

  if (!["candidate", "coach", "admin"].includes(role)) {
    redirect(`/onboarding/role?error=${encodeURIComponent("Select a valid account type.")}`);
  }

  if (role === "admin") {
    const expected = process.env.ADMIN_INVITE_CODE || "";
    if (!expected || inviteCode !== expected) {
      redirect(
        `/onboarding/role?error=${encodeURIComponent(
          "Administrator accounts require a valid ADMIN_INVITE_CODE. Contact Life Star to receive one.",
        )}`,
      );
    }
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { role },
  });

  if (role === "candidate") {
    const existing = await prisma.enrollment.findFirst({ where: { userId: session.id } });
    if (!existing) {
      const level =
        (await prisma.enrollmentLevel.findUnique({ where: { code: "professional" } })) ||
        (await prisma.enrollmentLevel.findFirst({ where: { isActive: true } }));
      if (level) {
        await prisma.enrollment.create({
          data: {
            userId: session.id,
            levelId: level.id,
            status: "active",
            enrollmentNumber: await generateEnrollmentNumber(),
          },
        });
      }
    }
  }

  // Refresh session cookie with new role
  const { createSession } = await import("@/lib/auth");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "candidate" | "coach" | "admin",
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      action: "onboarding.role_selected",
      metaJson: JSON.stringify({ role }),
    },
  });

  if (role === "admin") redirect("/admin");
  redirect("/onboarding/profile");
}

export default async function RoleOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const inviteRequired = Boolean(process.env.ADMIN_INVITE_CODE);

  return (
    <AuthShell
      headline="Choose Your Role"
      imageSrc="/cms/mock-auth-road.jpg"
      bullets={[
        { title: "Student pathway", body: "Full Instructor Academy learning and certification." },
        { title: "Instructor pathway", body: "Coach tools and practicum support." },
        { title: "Admin pathway", body: "Operations console — invite code required." },
      ]}
    >
      <h2 className="text-2xl font-bold text-[var(--navy)]">Select Your Account Type</h2>
      <p className="mt-1 text-sm text-[var(--steel)]">You can continue with the role that matches how you use Life Star.</p>
      {params.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{params.error}</p>
      )}
      <div className="mt-6">
        <RolePicker action={saveRole} inviteRequired={inviteRequired} />
      </div>
    </AuthShell>
  );
}
