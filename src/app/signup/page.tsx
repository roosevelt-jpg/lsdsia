import Link from "next/link";
import { redirect } from "next/navigation";
import { createSession, getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function signupAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const levelCode = String(formData.get("levelCode") || "professional");

  if (!name || !email || password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent("Name, email, and password (8+ chars) are required.")}`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/signup?error=${encodeURIComponent("An account with that email already exists.")}`);
  }

  const level = await prisma.enrollmentLevel.findUnique({ where: { code: levelCode } });
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "candidate",
      profile: { create: {} },
      applicationPacket: {
        create: {
          fullName: name,
          employingSchoolName: "Life Star Driving School",
          employingSchoolAddress: "Minnesota main campus",
        },
      },
      ...(level
        ? { enrollments: { create: { levelId: level.id, status: "active" } } }
        : {}),
    },
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "candidate" | "coach" | "admin",
  });
  redirect("/app");
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app");
  const params = await searchParams;
  const levels = await prisma.enrollmentLevel.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--mist)] px-5 py-16">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm ring-1 ring-[var(--navy)]/10">
        <p className="font-display text-2xl text-[var(--navy)]">Life Star Driving School</p>
        <h1 className="mt-2 text-lg text-[var(--steel)]">Create your academy account</h1>
        {params.error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{params.error}</p>
        )}
        <form action={signupAction} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <div>
            <Label htmlFor="levelCode">Enrollment level</Label>
            <select
              id="levelCode"
              name="levelCode"
              defaultValue="professional"
              className="flex h-10 w-full rounded-md border border-[var(--navy)]/15 bg-white px-3 text-sm"
            >
              {levels.map((l) => (
                <option key={l.id} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>
        <p className="mt-4 text-sm text-[var(--steel)]">
          Already enrolled?{" "}
          <Link href="/login" className="font-medium text-[var(--navy)] underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
