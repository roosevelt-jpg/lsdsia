import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft, MailOpen } from "lucide-react";
import { getSession } from "@/lib/auth";
import { absoluteUrl, isResendConfigured, sendPasswordResetEmail } from "@/lib/email";
import { createPasswordResetToken } from "@/lib/password-reset";
import { AuthShell } from "@/components/auth/auth-shell";
import { prisma } from "@/lib/db";

async function requestReset(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    redirect(`/forgot-password?error=${encodeURIComponent("Enter your email address.")}`);
  }

  const result = await createPasswordResetToken(email);
  if (result.token && result.userId) {
    const resetUrl = absoluteUrl(`/reset-password?token=${result.token}`);
    const user = await prisma.user.findUnique({ where: { id: result.userId } });
    const send = await sendPasswordResetEmail({
      to: email,
      name: user?.name || "there",
      resetUrl,
    });

    if (send.ok && "skipped" in send && send.skipped) {
      // No Resend key: keep a local/dev fallback link so resets still work.
      redirect(`/forgot-password?sent=1&fallback=1&demo=${encodeURIComponent(resetUrl)}`);
    }
    if (!send.ok) {
      redirect(
        `/forgot-password?error=${encodeURIComponent(
          `We could not send email (${send.error}). Check RESEND_API_KEY / EMAIL_FROM in Vercel.`,
        )}`,
      );
    }
  }

  redirect("/forgot-password?sent=1");
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; demo?: string; fallback?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/app");
  const params = await searchParams;
  const emailReady = isResendConfigured();

  return (
    <AuthShell
      headline="Forgot Your Password?"
      imageSrc="/cms/mock-auth-car.jpg"
      bullets={[
        { title: "Secure reset link", body: "We email a one-hour link to set a new password." },
        { title: "Account safety", body: "Your session stays protected while you reset." },
        { title: "Need help?", body: "Contact admissions if you no longer have email access." },
      ]}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--navy)]/8 text-[var(--navy)]">
        <MailOpen className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--navy)]">Reset Your Password</h2>
      <p className="mt-1 text-sm text-[var(--steel)]">
        Enter the email for your Life Star account and we&apos;ll send a reset link.
      </p>

      {params.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{params.error}</p>
      )}
      {params.sent && (
        <div className="mt-4 space-y-2 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
          <p>
            {emailReady && !params.fallback
              ? "If an account exists for that email, a Life Star reset email is on the way."
              : "If an account exists for that email, a reset link has been created."}
          </p>
          {params.fallback && (
            <p className="rounded-md bg-amber-50 px-2 py-2 text-xs text-amber-950">
              Email delivery is not configured (<code className="font-mono">RESEND_API_KEY</code> missing). Add the
              Resend Marketplace plugin in Vercel (or set <code className="font-mono">RESEND_API_KEY</code> +{" "}
              <code className="font-mono">EMAIL_FROM</code>) and redeploy. Temporary reset link for this environment:{" "}
              {params.demo ? (
                <Link href={params.demo} className="font-semibold underline">
                  Open reset page
                </Link>
              ) : null}
            </p>
          )}
        </div>
      )}

      <form action={requestReset} className="mt-6 space-y-4">
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
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--navy)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--navy-deep)]"
        >
          Send Reset Link <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--navy)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>
    </AuthShell>
  );
}
