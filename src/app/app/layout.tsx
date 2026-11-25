import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/app-nav";
import { candidateNeedsLicenseUpload } from "@/lib/onboarding";

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

  return (
    <div className="min-h-screen bg-[var(--mist)] md:flex">
      <AppNav />
      <div className="flex-1 px-5 py-8 md:px-8">{children}</div>
    </div>
  );
}
