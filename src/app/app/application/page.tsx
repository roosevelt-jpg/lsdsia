import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { computeCompleteness } from "@/lib/application";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function savePacket(formData: FormData) {
  "use server";
  const session = await requireUser();
  if (!session) redirect("/login");

  const data = {
    fullName: String(formData.get("fullName") || "") || null,
    birthDate: String(formData.get("birthDate") || "") || null,
    address1: String(formData.get("address1") || "") || null,
    address2: String(formData.get("address2") || "") || null,
    city: String(formData.get("city") || "") || null,
    state: String(formData.get("state") || "") || null,
    zip: String(formData.get("zip") || "") || null,
    dlNumber: String(formData.get("dlNumber") || "") || null,
    ssnLast4: String(formData.get("ssnLast4") || "").slice(-4) || null,
    phone: String(formData.get("phone") || "") || null,
    employingSchoolName: String(formData.get("employingSchoolName") || "") || null,
    employingSchoolAddress: String(formData.get("employingSchoolAddress") || "") || null,
    educationProvider: String(formData.get("educationProvider") || "") || null,
    educationLocation: String(formData.get("educationLocation") || "") || null,
    classroomCompetencyDate: String(formData.get("classroomCompetencyDate") || "") || null,
    laboratoryCompetencyDate: String(formData.get("laboratoryCompetencyDate") || "") || null,
    applicantCertified: formData.get("applicantCertified") === "on",
    privacyAcknowledged: formData.get("privacyAcknowledged") === "on",
  };

  const completenessPercent = computeCompleteness(data);

  await prisma.applicationPacket.upsert({
    where: { userId: session.id },
    create: { userId: session.id, ...data, completenessPercent },
    update: { ...data, completenessPercent },
  });

  redirect("/app/application?saved=1");
}

export default async function ApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await requireUser();
  if (!session) return null;
  const params = await searchParams;

  const packet = await prisma.applicationPacket.findUnique({ where: { userId: session.id } });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Application preparation packet</h1>
      <p className="mt-2 text-sm text-[var(--steel)]">
        Life Star preparation packet modeled on MN DPS <strong>PS36008-10</strong>. This is{" "}
        <em>not</em> the official state form — you still file with MN DPS. Cites Minnesota Statutes{" "}
        <strong>171.33–171.41</strong> and Rules <strong>7411.0100–7411.2000</strong>. Completeness:{" "}
        {packet?.completenessPercent ?? 0}%.
      </p>
      {params.saved && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Saved.</p>
      )}

      <form action={savePacket} className="mt-8 space-y-8">
        <Card>
          <h2 className="font-display text-xl text-[var(--navy)]">Part A — Identification</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" defaultValue={packet?.fullName ?? ""} />
            </div>
            <div>
              <Label htmlFor="birthDate">Birth date</Label>
              <Input id="birthDate" name="birthDate" type="date" defaultValue={packet?.birthDate ?? ""} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={packet?.phone ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address1">Address</Label>
              <Input id="address1" name="address1" defaultValue={packet?.address1 ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address2">Address line 2</Label>
              <Input id="address2" name="address2" defaultValue={packet?.address2 ?? ""} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={packet?.city ?? ""} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={packet?.state ?? "MN"} />
            </div>
            <div>
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" name="zip" defaultValue={packet?.zip ?? ""} />
            </div>
            <div>
              <Label htmlFor="dlNumber">Driver license number</Label>
              <Input id="dlNumber" name="dlNumber" defaultValue={packet?.dlNumber ?? ""} />
            </div>
            <div>
              <Label htmlFor="ssnLast4">SSN (last 4 only — masked)</Label>
              <Input
                id="ssnLast4"
                name="ssnLast4"
                maxLength={4}
                defaultValue={packet?.ssnLast4 ?? ""}
                placeholder="••••"
              />
            </div>
            <div>
              <Label htmlFor="employingSchoolName">Employing commercial school</Label>
              <Input
                id="employingSchoolName"
                name="employingSchoolName"
                defaultValue={packet?.employingSchoolName ?? "Life Star Driving School"}
              />
            </div>
            <div>
              <Label htmlFor="employingSchoolAddress">School address</Label>
              <Input
                id="employingSchoolAddress"
                name="employingSchoolAddress"
                defaultValue={packet?.employingSchoolAddress ?? "Minnesota main campus"}
              />
            </div>
            <div>
              <Label htmlFor="educationProvider">Education / training provider</Label>
              <Input
                id="educationProvider"
                name="educationProvider"
                defaultValue={packet?.educationProvider ?? "Life Star Driving School"}
              />
            </div>
            <div>
              <Label htmlFor="educationLocation">Provider location</Label>
              <Input
                id="educationLocation"
                name="educationLocation"
                defaultValue={packet?.educationLocation ?? "Minnesota main campus"}
              />
            </div>
            <div>
              <Label htmlFor="classroomCompetencyDate">Classroom competencies (7411.0630) date</Label>
              <Input
                id="classroomCompetencyDate"
                name="classroomCompetencyDate"
                type="date"
                defaultValue={packet?.classroomCompetencyDate ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="laboratoryCompetencyDate">Laboratory competencies (7411.0630) date</Label>
              <Input
                id="laboratoryCompetencyDate"
                name="laboratoryCompetencyDate"
                type="date"
                defaultValue={packet?.laboratoryCompetencyDate ?? ""}
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-[var(--steel)]">
            Checklist (upload offline / later): out-of-state DL record if needed, high school diploma/GED, fingerprint
            card fee note.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-[var(--navy)]">Part B — Certifications</h2>
          <p className="mt-2 text-sm text-[var(--steel)]">
            School official attestation is completed by Life Star admin/coach later. Privacy notice summary references
            M.S. 13.04; failure to complete leads to disapproval; fees are non-refundable if disapproved.
          </p>
          <label className="mt-4 flex items-start gap-2 text-sm text-[var(--navy)]">
            <input
              type="checkbox"
              name="applicantCertified"
              defaultChecked={packet?.applicantCertified}
              className="mt-1"
            />
            I certify that I meet Minnesota instructor qualifications and driving-history requirements as stated in the
            rules.
          </label>
          <label className="mt-3 flex items-start gap-2 text-sm text-[var(--navy)]">
            <input
              type="checkbox"
              name="privacyAcknowledged"
              defaultChecked={packet?.privacyAcknowledged}
              className="mt-1"
            />
            I acknowledge the privacy notice (M.S. 13.04) and that incomplete applications may be disapproved with fees
            non-refundable.
          </label>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">Save packet</Button>
          <Button asChild variant="outline">
            <Link href="/app/application/pdf">Download PDF export</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
