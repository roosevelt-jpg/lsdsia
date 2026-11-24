import { redirect } from "next/navigation";
import { requireUser, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";

async function logout() {
  "use server";
  await destroySession();
  redirect("/");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["admin"]);
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: profile?.avatarUrl ?? null,
      }}
      logoutAction={logout}
    >
      {children}
    </AdminShell>
  );
}
