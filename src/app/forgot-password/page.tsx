import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft, MailOpen } from "lucide-react";
import { getSession } from "@/lib/auth";
import { createPasswordResetToken, publicOrigin } from "@/lib/password-reset";
import { AuthShell } from "@/components/auth/auth-shell";

async function requestReset(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    redirect(`/forgot-password?error=${encodeURIComponent("Enter your email address.")}`);
  }

  const result = await createPasswordResetToken(email);
  // Dev/demo: when APP_URL is set and a token was minted, include a one-time link on the success page
  // for environments without SMTP. Production should wire email delivery later.
  if (result.token) {
    const origin = publicOrigin() || "";
    const link = `${origin || ""}/reset-password?token=${result.token}`;
    redirect(`/forgot-password?sent=1&demo=${encodeURIComponent(link)}`);
  }
  redirect("/forgot-password?sent=1");
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; demo?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/app");
  const params = await searchParams;

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
          <p>If an account exists for that email, a reset link has been created.</p>
          {params.demo && (
            <p className="break-all text-xs">
              Demo reset link (configure SMTP later for email delivery):{" "}
              <Link href={params.demo} className="font-semibold underline">
                Open reset page
              </Link>
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
