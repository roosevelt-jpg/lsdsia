import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, User, ArrowRight } from "lucide-react";
import { createSession, getSession, hashPassword } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";

async function signupAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirmPassword") || "");
  const terms = formData.get("terms") === "1";

  if (!name || !email || password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent("Name, email, and password (8+ chars) are required.")}`);
  }
  if (password !== confirm) {
    redirect(`/signup?error=${encodeURIComponent("Passwords do not match.")}`);
  }
  if (!terms) {
    redirect(`/signup?error=${encodeURIComponent("Please agree to the Terms of Service and Privacy Policy.")}`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/signup?error=${encodeURIComponent("An account with that email already exists.")}`);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "candidate",
      profile: { create: { onboardingStep: 0 } },
      applicationPacket: {
        create: {
          fullName: name,
          employingSchoolName: "Life Star Driving School",
          employingSchoolAddress: "Minnesota main campus",
        },
      },
    },
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "candidate" | "coach" | "admin",
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "auth.signup",
      metaJson: JSON.stringify({ email }),
    },
  });

  // Welcome / signup confirmation via Resend when configured (never blocks onboarding).
  void sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
    console.error("welcome email", err),
  );

  redirect("/onboarding/role");
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    const profile = await prisma.profile.findUnique({ where: { userId: session.id } });
    if (!profile?.profileCompletedAt) redirect("/onboarding/role");
    redirect(session.role === "admin" ? "/admin" : "/app");
  }
  const params = await searchParams;

  return (
    <AuthShell
      headline="Join Life Star Instructors Academy"
      subheadline="Become a certified driving instructor, build your expertise, and grow your career globally."
      imageSrc="/cms/mock-auth-instructors.jpg"
      bullets={[
        { title: "Internationally Recognized Training" },
        { title: "Instructor Licensing Preparation" },
        { title: "Start Your Own Driving School" },
        { title: "Ongoing Professional Support" },
      ]}
    >
      <h2 className="text-2xl font-bold text-[var(--navy)]">Create Your Account</h2>
      <p className="mt-1 text-sm text-[var(--steel)]">Get started in just a few steps.</p>

      {params.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{params.error}</p>
      )}

      <form action={signupAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--steel)]" />
            <input
              id="name"
              name="name"
              required
              className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 bg-white py-2 pl-10 pr-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--steel)]" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 bg-white py-2 pl-10 pr-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
            />
          </div>
        </div>

        <PasswordField id="password" name="password" label="Password" autoComplete="new-password" minLength={8} />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          autoComplete="new-password"
          minLength={8}
        />

        <label className="flex items-start gap-2 text-sm text-[var(--navy)]">
          <input type="checkbox" name="terms" value="1" required className="mt-1 h-4 w-4 rounded border-[var(--navy)]/30" />
          <span>
            I agree to the{" "}
            <Link href="/resources#terms" className="font-semibold underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/resources#privacy" className="font-semibold underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--amber)] px-4 py-3 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
        >
          Create Account <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--steel)]">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-[var(--navy)] hover:underline">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
