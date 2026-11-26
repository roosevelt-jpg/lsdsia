import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, ArrowRight } from "lucide-react";
import { getSession, loginWithCredentials } from "@/lib/auth";
import { isGatedPath, safeNextPath } from "@/lib/auth-paths";
import { prisma } from "@/lib/db";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";

function postLoginPath(role: string, nextRaw: string | null, profileDone: boolean): string {
  const next = safeNextPath(nextRaw, "");
  if (next) {
    if (next.startsWith("/admin")) {
      return role === "admin" ? next : "/app";
    }
    if (isGatedPath(next.split("?")[0])) return next;
    if (next.startsWith("/")) return next;
  }
  if (role === "admin") return "/admin";
  if (!profileDone) return "/onboarding/profile";
  return "/app";
}

async function loginAction(formData: FormData) {
  "use server";
  const nextRaw = String(formData.get("next") || "");
  try {
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const remember = formData.get("remember") === "1";
    const result = await loginWithCredentials(email, password, { remember });
    if ("error" in result && result.error) {
      const q = new URLSearchParams({ error: result.error });
      if (nextRaw) q.set("next", nextRaw);
      redirect(`/login?${q.toString()}`);
    }
    if (!("user" in result) || !result.user) {
      const q = new URLSearchParams({ error: "Invalid email or password" });
      if (nextRaw) q.set("next", nextRaw);
      redirect(`/login?${q.toString()}`);
    }

    const profile = await prisma.profile.findUnique({ where: { userId: result.user.id } });
    redirect(
      postLoginPath(result.user.role, nextRaw, Boolean(profile?.profileCompletedAt)),
    );
  } catch (err) {
    const digest = err && typeof err === "object" && "digest" in err ? String((err as { digest?: string }).digest) : "";
    if (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND")) throw err;
    console.error("loginAction", err);
    const q = new URLSearchParams({
      error:
        "Login failed on the server. Set AUTH_SECRET, ADMIN_PASSWORD, and DEMO_PASSWORD in Vercel, then Redeploy.",
    });
    if (nextRaw) q.set("next", nextRaw);
    redirect(`/login?${q.toString()}`);
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "");
  const session = await getSession();
  if (session) {
    redirect(postLoginPath(session.role, next || null, true));
  }
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const microsoftConfigured = Boolean(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET);

  return (
    <AuthShell
      headline="Welcome Back to Life Star Instructors Academy"
      subheadline="Access your training, courses, certifications, and academy resources."
      imageSrc="/cms/mock-auth-car.jpg"
      bullets={[
        { title: "World-Class Instructor Training" },
        { title: "Flexible Online Learning" },
        { title: "Minnesota Campus Practical Training" },
        { title: "Certification & Licensing Preparation" },
      ]}
    >
      <h2 className="text-2xl font-bold text-[var(--navy)]">Sign In to Your Account</h2>
      <p className="mt-1 text-sm text-[var(--steel)]">Continue your professional training journey.</p>

      {params.reset && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Password updated. Sign in with your new password.
        </p>
      )}
      {params.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{params.error}</p>
      )}

      <form action={loginAction} className="mt-6 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
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

        <PasswordField id="password" name="password" label="Password" autoComplete="current-password" />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 text-[var(--navy)]">
            <input type="checkbox" name="remember" value="1" className="h-4 w-4 rounded border-[var(--navy)]/30" />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-semibold text-[var(--navy)] hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--navy)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--navy-deep)]"
        >
          Sign In <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--navy)]/10" />
        <span className="text-xs uppercase tracking-wide text-[var(--steel)]">or continue with</span>
        <div className="h-px flex-1 bg-[var(--navy)]/10" />
      </div>

      <div className="grid gap-3">
        <a
          href={
            googleConfigured
              ? `/api/auth/oauth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`
              : "/login?error=" +
                encodeURIComponent("Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel.")
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--navy)]/15 px-4 py-2.5 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--mist)]"
        >
          Continue with Google
        </a>
        <a
          href={
            microsoftConfigured
              ? `/api/auth/oauth/microsoft${next ? `?next=${encodeURIComponent(next)}` : ""}`
              : "/login?error=" +
                encodeURIComponent(
                  "Microsoft sign-in is not configured. Set AZURE_AD_CLIENT_ID and AZURE_AD_CLIENT_SECRET in Vercel.",
                )
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--navy)]/15 px-4 py-2.5 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--mist)]"
        >
          Continue with Microsoft
        </a>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--steel)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-[var(--navy)] hover:underline">
          Create Account
        </Link>
      </p>
    </AuthShell>
  );
}
