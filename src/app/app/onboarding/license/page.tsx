import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ensureLicenseRow } from "@/lib/onboarding";
import { getIdentityDocStatus, saveIdentityDocuments } from "@/lib/identity-docs";
import { IdentityDocumentsFields } from "@/components/onboarding/identity-documents-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function submitIdentityDocs(formData: FormData) {
  "use server";
  const session = await requireUser(["candidate", "admin", "coach"]);
  if (session.role !== "candidate" && session.role !== "admin") {
    redirect("/app");
  }
  const userId = session.role === "admin" ? String(formData.get("userId") || session.id) : session.id;

  try {
    await saveIdentityDocuments({
      userId,
      actorId: session.id,
      formData,
      requireAll: true,
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
  const docs = await getIdentityDocStatus(session.id);

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--amber)]">Onboarding</p>
      <h1 className="mt-2 font-display text-3xl text-[var(--navy)]">Identity document verification</h1>
      <p className="mt-3 text-sm text-[var(--steel)]">
        Students worldwide are welcome. Life Star requires your government-issued driver’s license, a passport-style
        photo, and a travel passport copy before you continue the Instructor Academy. Files are stored privately (not
        on a public URL). An admin reviews submissions — you only need to submit to unlock the rest of the academy.
      </p>

      {params.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{params.error}</p>
      )}
      {params.ok && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Identity documents submitted for review. Status: pending.
        </p>
      )}

      <Card className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--steel)]">Current status</span>
          <span className="rounded-full bg-[var(--mist)] px-3 py-1 font-medium capitalize text-[var(--navy)]">
            {row.status.replaceAll("_", " ")}
          </span>
        </div>

        <ul className="space-y-1 text-sm text-[var(--navy)]">
          <li>
            Driver’s license:{" "}
            {docs.hasLicense && row.uploadId ? (
              <a className="underline" href={`/api/private-uploads/${row.uploadId}`}>
                on file
              </a>
            ) : (
              <span className="text-amber-700">needed</span>
            )}
          </li>
          <li>
            Passport photo:{" "}
            {docs.hasPassportPhoto && row.passportPhotoUploadId ? (
              <a className="underline" href={`/api/private-uploads/${row.passportPhotoUploadId}`}>
                on file
              </a>
            ) : (
              <span className="text-amber-700">needed</span>
            )}
          </li>
          <li>
            Travel passport:{" "}
            {docs.hasTravelPassport && row.travelPassportUploadId ? (
              <a className="underline" href={`/api/private-uploads/${row.travelPassportUploadId}`}>
                on file
              </a>
            ) : (
              <span className="text-amber-700">needed</span>
            )}
          </li>
        </ul>

        {row.adminNote && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">Admin note: {row.adminNote}</p>
        )}

        {(row.status === "not_submitted" || row.status === "rejected" || row.status === "pending" || !docs.complete) && (
          <form action={submitIdentityDocs} className="space-y-4 border-t border-[var(--navy)]/10 pt-4">
            <IdentityDocumentsFields
              requireFiles
              defaultLicenseState={row.licenseState ?? ""}
              defaultLicenseNumber={row.licenseNumber ?? ""}
              defaultPassportNumber={row.passportNumber ?? ""}
              hasLicense={docs.hasLicense}
              hasPassportPhoto={docs.hasPassportPhoto}
              hasTravelPassport={docs.hasTravelPassport}
            />
            <Button type="submit" className="w-full">
              {docs.complete ? "Replace / update documents" : "Submit for verification"}
            </Button>
          </form>
        )}

        {row.status === "approved" && docs.complete && (
          <Button asChild className="w-full">
            <a href="/app">Continue to dashboard</a>
          </Button>
        )}
        {row.status === "pending" && docs.complete && (
          <Button asChild variant="outline" className="w-full">
            <a href="/app">Continue while review is pending</a>
          </Button>
        )}
      </Card>
    </div>
  );
}
