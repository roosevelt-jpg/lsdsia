import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, loginWithCredentials } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function loginAction(formData: FormData) {
  "use server";
  try {
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const result = await loginWithCredentials(email, password);
    if ("error" in result && result.error) {
      redirect(`/login?error=${encodeURIComponent(result.error)}`);
    }
    if (!("user" in result) || !result.user) {
      redirect(`/login?error=${encodeURIComponent("Invalid email or password")}`);
    }
    redirect(result.user.role === "admin" ? "/admin" : "/app");
  } catch (err) {
    // redirect() throws; rethrow Next navigation errors
    const digest = err && typeof err === "object" && "digest" in err ? String((err as { digest?: string }).digest) : "";
    if (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND")) throw err;
    console.error("loginAction", err);
    redirect(
      `/login?error=${encodeURIComponent(
        "Login failed on the server. Set AUTH_SECRET, ADMIN_PASSWORD, and DEMO_PASSWORD in Vercel, then Redeploy.",
      )}`,
    );
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/app");
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--mist)] px-5 py-16">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm ring-1 ring-[var(--navy)]/10">
        <p className="font-display text-2xl text-[var(--navy)]">Life Star Driving School</p>
        <h1 className="mt-2 text-lg text-[var(--steel)]">Log in to the Instructor Academy</h1>
        {params.error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{params.error}</p>
        )}
        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
        <p className="mt-4 text-sm text-[var(--steel)]">
          New candidate?{" "}
          <Link href="/signup" className="font-medium text-[var(--navy)] underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
