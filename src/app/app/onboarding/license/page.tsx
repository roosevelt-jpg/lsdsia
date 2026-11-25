import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureLicenseRow } from "@/lib/onboarding";
import { savePrivateUpload } from "@/lib/private-uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function submitLicense(formData: FormData) {
  "use server";
  const session = await requireUser(["candidate", "admin", "coach"]);
  if (session.role !== "candidate" && session.role !== "admin") {
    redirect("/app");
  }
  const userId = session.role === "admin" ? String(formData.get("userId") || session.id) : session.id;
  const licenseNumber = String(formData.get("licenseNumber") || "").trim() || null;
  const licenseState = String(formData.get("licenseState") || "").trim().toUpperCase() || null;
  const file = formData.get("licenseFile");

  if (!(file instanceof File) || file.size <= 0) {
    redirect("/app/onboarding/license?error=" + encodeURIComponent("Upload a photo or PDF of your driver’s license."));
  }

  try {
    const upload = await savePrivateUpload({ userId, kind: "drivers_license", file });
    await ensureLicenseRow(userId);
    await prisma.licenseVerification.update({
      where: { userId },
      data: {
        status: "pending",
        uploadId: upload.id,
        licenseNumber,
        licenseState,
        submittedAt: new Date(),
        adminNote: null,
        reviewedAt: null,
        reviewedById: null,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "onboarding.license_submitted",
        metaJson: JSON.stringify({ userId, uploadId: upload.id }),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    redirect("/app/onboarding/license?error=" + encodeURIComponent(msg));
  }

  redirect("/app/onboarding/license?ok=1");
}

export default async function LicenseOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;
  const row = await ensureLicenseRow(session.id);

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--amber)]">Onboarding</p>
      <h1 className="mt-2 font-display text-3xl text-[var(--navy)]">Driver’s license verification</h1>
      <p className="mt-3 text-sm text-[var(--steel)]">
        Students worldwide are welcome. Life Star requires a government-issued driver’s license upload before you
        continue the Instructor Academy. Files are stored privately (not on a public URL). An admin reviews
        submissions — you only need to submit to unlock the rest of the academy.
      </p>

      {params.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{params.error}</p>
      )}
      {params.ok && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          License submitted for review. Status: pending.
        </p>
      )}

      <Card className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--steel)]">Current status</span>
          <span className="rounded-full bg-[var(--mist)] px-3 py-1 font-medium capitalize text-[var(--navy)]">
            {row.status.replaceAll("_", " ")}
          </span>
        </div>
        {row.adminNote && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">Admin note: {row.adminNote}</p>
        )}
        {row.uploadId && (
          <p className="text-sm text-[var(--steel)]">
            File on file.{" "}
            <a className="underline" href={`/api/private-uploads/${row.uploadId}`}>
              View your upload
            </a>
          </p>
        )}

        {(row.status === "not_submitted" || row.status === "rejected" || row.status === "pending") && (
          <form action={submitLicense} className="space-y-4 border-t border-[var(--navy)]/10 pt-4">
            <div>
              <Label htmlFor="licenseState">License state</Label>
              <Input id="licenseState" name="licenseState" placeholder="e.g. MN" defaultValue={row.licenseState ?? ""} maxLength={2} />
            </div>
            <div>
              <Label htmlFor="licenseNumber">License number (optional)</Label>
              <Input id="licenseNumber" name="licenseNumber" defaultValue={row.licenseNumber ?? ""} />
            </div>
            <div>
              <Label htmlFor="licenseFile">License image or PDF</Label>
              <Input id="licenseFile" name="licenseFile" type="file" accept="image/*,application/pdf" required />
              <p className="mt-1 text-xs text-[var(--steel)]">Max 900KB. Not published to the open web.</p>
            </div>
            <Button type="submit" className="w-full">
              {row.status === "pending" ? "Replace upload" : "Submit for verification"}
            </Button>
          </form>
        )}

        {row.status === "approved" && (
          <Button asChild className="w-full">
            <a href="/app">Continue to dashboard</a>
          </Button>
        )}
        {row.status === "pending" && (
          <Button asChild variant="outline" className="w-full">
            <a href="/app">Continue while review is pending</a>
          </Button>
        )}
      </Card>
    </div>
  );
}
