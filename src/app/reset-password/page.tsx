import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { resetPasswordWithToken } from "@/lib/password-reset";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";

async function resetAction(formData: FormData) {
  "use server";
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirmPassword") || "");
  if (password !== confirm) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent("Passwords do not match.")}`);
  }
  const result = await resetPasswordWithToken(token, password);
  if (!result.ok) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(result.error)}`);
  }
  redirect("/login?reset=1");
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/app");
  const params = await searchParams;
  const token = params.token || "";

  if (!token) {
    return (
      <AuthShell
        headline="Reset link required"
        imageSrc="/cms/mock-auth-car.jpg"
        bullets={[{ title: "Request a new link", body: "Use Forgot Password to get a fresh reset email." }]}
      >
        <h2 className="text-2xl font-bold text-[var(--navy)]">Invalid reset link</h2>
        <p className="mt-2 text-sm text-[var(--steel)]">This page needs a valid token from your reset email.</p>
        <Link href="/forgot-password" className="mt-6 inline-block font-bold text-[var(--navy)] underline">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      headline="Choose a new password"
      imageSrc="/cms/mock-auth-car.jpg"
      bullets={[
        { title: "Use 8+ characters", body: "Strong passwords protect your academy account." },
        { title: "One-time link", body: "This reset token expires after use or one hour." },
      ]}
    >
      <h2 className="text-2xl font-bold text-[var(--navy)]">Set a new password</h2>
      {params.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{params.error}</p>
      )}
      <form action={resetAction} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <PasswordField id="password" name="password" label="New Password" autoComplete="new-password" minLength={8} />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm New Password"
          autoComplete="new-password"
          minLength={8}
        />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--navy)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--navy-deep)]"
        >
          Update Password <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </AuthShell>
  );
}
