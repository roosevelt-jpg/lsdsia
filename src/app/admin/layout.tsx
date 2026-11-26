import { redirect } from "next/navigation";
import { requireUser, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadCmsSite } from "@/lib/cms";
import { getConsoleView } from "@/lib/console-view";
import { AdminShell } from "@/components/admin/admin-shell";

async function logout() {
  "use server";
  await destroySession();
  redirect("/");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["admin"]);
  const [profile, site, viewMode] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    loadCmsSite(),
    getConsoleView(),
  ]);

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: profile?.avatarUrl ?? null,
      }}
      site={{
        brandName: site.brandName,
        logoUrl: site.logoUrl,
        dashboardTagline: site.dashboardTagline,
      }}
      viewMode={viewMode}
      logoutAction={logout}
    >
      {children}
    </AdminShell>
  );
}
