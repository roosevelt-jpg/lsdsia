import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireUser, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { candidateNeedsLicenseUpload } from "@/lib/onboarding";
import { loadCmsSite, resolveCmsImage } from "@/lib/cms";
import { CandidateShell } from "@/components/candidate/candidate-shell";

async function logout() {
  "use server";
  await destroySession();
  redirect("/");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const hdrs = await headers();
  const pathname = hdrs.get("x-url-path") || "";

  if (user.role === "candidate") {
    const needsUpload = await candidateNeedsLicenseUpload(user.id, user.role);
    const onLicensePage = pathname.startsWith("/app/onboarding/license");
    if (needsUpload && !onLicensePage) {
      redirect("/app/onboarding/license");
    }
  }

  const [profile, site, media, upcomingCount] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    loadCmsSite(),
    prisma.cmsMedia.findMany(),
    prisma.practicumBooking.count({
      where: { userId: user.id, status: { in: ["requested", "confirmed"] } },
    }),
  ]);
  const mediaMap = Object.fromEntries(media.map((m) => [m.key, `/api/cms-media/${m.key}`]));

  const avatarUrl = profile?.idPhotoUploadId
    ? `/api/private-uploads/${profile.idPhotoUploadId}`
    : profile?.avatarUrl || null;

  return (
    <CandidateShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl,
      }}
      site={{
        brandName: site.brandName,
        logoUrl: site.logoUrl,
        dashboardTagline: site.dashboardTagline,
        dashboardUpgradeImageUrl:
          resolveCmsImage(site.dashboardUpgradeImageUrl, mediaMap) || site.dashboardUpgradeImageUrl,
        dashboardUpgradeTitle: site.dashboardUpgradeTitle,
        dashboardUpgradeBody: site.dashboardUpgradeBody,
        dashboardUpgradeCtaLabel: site.dashboardUpgradeCtaLabel,
        dashboardUpgradeCtaHref: site.dashboardUpgradeCtaHref,
      }}
      messageCount={3}
      sessionDot={upcomingCount > 0}
      logoutAction={logout}
    >
      {children}
    </CandidateShell>
  );
}
