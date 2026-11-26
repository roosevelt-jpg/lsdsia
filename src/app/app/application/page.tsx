import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  APPLICATION_DOC_KINDS,
  composeFullName,
  computeCompleteness,
  extractSsnLast4,
} from "@/lib/application";
import { savePrivateUpload } from "@/lib/private-uploads";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

async function ensurePacket(userId: string) {
  return prisma.applicationPacket.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { documents: true },
  });
}

async function savePacket(formData: FormData) {
  "use server";
  const session = await requireUser();
  const intent = String(formData.get("intent") || "save");

  const lastName = String(formData.get("lastName") || "").trim() || null;
  const firstName = String(formData.get("firstName") || "").trim() || null;
  const middleName = String(formData.get("middleName") || "").trim() || null;
  const fullName = composeFullName({ lastName, firstName, middleName });
  const ssnRaw = String(formData.get("ssn") || formData.get("ssnLast4") || "");
  const ssnLast4 = extractSsnLast4(ssnRaw) || null;

  const data = {
    lastName,
    firstName,
    middleName,
    fullName,
    birthDate: String(formData.get("birthDate") || "") || null,
    address1: String(formData.get("address1") || "") || null,
    address2: String(formData.get("address2") || "") || null,
    city: String(formData.get("city") || "") || null,
    state: String(formData.get("state") || "") || null,
    zip: String(formData.get("zip") || "") || null,
    dlNumber: String(formData.get("dlNumber") || "") || null,
    ssnLast4,
    phone: String(formData.get("phone") || "") || null,
    employingSchoolName: String(formData.get("employingSchoolName") || "") || null,
    employingSchoolAddress: String(formData.get("employingSchoolAddress") || "") || null,
    educationProvider: String(formData.get("educationProvider") || "") || null,
    educationLocation: String(formData.get("educationLocation") || "") || null,
    classroomCompetencyDate: String(formData.get("classroomCompetencyDate") || "") || null,
    laboratoryCompetencyDate: String(formData.get("laboratoryCompetencyDate") || "") || null,
    applicantCertified: formData.get("applicantCertified") === "on",
    privacyAcknowledged: formData.get("privacyAcknowledged") === "on",
    applicantSignature: String(formData.get("applicantSignature") || "").trim() || null,
    applicantSignedAt: String(formData.get("applicantSignedAt") || "") || null,
  };

  const completenessPercent = computeCompleteness(data);
  const submit = intent === "submit";
  if (submit && (!data.applicantCertified || !data.privacyAcknowledged || !data.applicantSignature)) {
    redirect(
      "/app/application?error=" +
        encodeURIComponent("Certify, acknowledge privacy, and sign before submitting."),
    );
  }

  await prisma.applicationPacket.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      ...data,
      completenessPercent,
      ...(submit
        ? { status: "submitted", submittedAt: new Date() }
        : { status: "draft" }),
    },
    update: {
      ...data,
      completenessPercent,
      ...(submit
        ? { status: "submitted", submittedAt: new Date() }
        : {}),
    },
  });

  redirect(submit ? "/app/application?submitted=1" : "/app/application?saved=1");
}

async function uploadAttachment(formData: FormData) {
  "use server";
  const session = await requireUser();
  const kind = String(formData.get("kind") || "").trim();
  const file = formData.get("file");
  if (!APPLICATION_DOC_KINDS.some((k) => k.kind === kind)) {
    redirect("/app/application?error=" + encodeURIComponent("Unknown attachment type."));
  }
  if (!(file instanceof File) || file.size <= 0) {
    redirect("/app/application?error=" + encodeURIComponent("Choose a file to upload."));
  }

  const packet = await ensurePacket(session.id);
  try {
    const upload = await savePrivateUpload({
      userId: session.id,
      kind: `application_${kind}`,
      file,
    });
    const existing = packet.documents.find((d) => d.kind === kind);
    if (existing) {
      await prisma.applicationDocument.update({
        where: { id: existing.id },
        data: { fileName: upload.fileName, uploadId: upload.id, filePath: upload.blobUrl || "" },
      });
    } else {
      await prisma.applicationDocument.create({
        data: {
          packetId: packet.id,
          kind,
          fileName: upload.fileName,
          uploadId: upload.id,
          filePath: upload.blobUrl || "",
        },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    redirect("/app/application?error=" + encodeURIComponent(msg));
  }
  redirect("/app/application?uploaded=1");
}

export default async function ApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; submitted?: string; uploaded?: string; error?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;
  const packet = await ensurePacket(session.id);
  const docsByKind = Object.fromEntries(packet.documents.map((d) => [d.kind, d]));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[var(--navy)]">Instructor application</h1>
          <p className="mt-2 text-sm text-[var(--steel)]">
            Life Star preparation packet modeled on MN DPS <strong>PS36008-10</strong>. This is{" "}
            <em>not</em> the official state form — you still file with MN DPS. Cites Minnesota Statutes{" "}
            <strong>171.33–171.41</strong> and Rules <strong>7411.0100–7411.2000</strong>.
          </p>
        </div>
        <div className="rounded-lg bg-[var(--navy)]/5 px-3 py-2 text-sm text-[var(--navy)]">
          <p>
            Completeness: <strong>{packet.completenessPercent}%</strong>
          </p>
          <p className="text-xs capitalize text-[var(--steel)]">Status: {packet.status.replace(/_/g, " ")}</p>
        </div>
      </div>

      {params.error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{params.error}</p>
      )}
      {params.saved && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Draft saved.</p>
      )}
      {params.submitted && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Packet submitted for Life Star review. An authorized official will attest Part B when competencies are
          confirmed.
        </p>
      )}
      {params.uploaded && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Attachment uploaded privately.</p>
      )}

      <form action={savePacket} className="mt-8 space-y-8">
        <Card>
          <h2 className="font-display text-xl text-[var(--navy)]">Part A — Identification data</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required defaultValue={packet.lastName ?? ""} />
            </div>
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required defaultValue={packet.firstName ?? ""} />
            </div>
            <div>
              <Label htmlFor="middleName">Middle name</Label>
              <Input id="middleName" name="middleName" defaultValue={packet.middleName ?? ""} />
            </div>
            <div>
              <Label htmlFor="birthDate">Birth date</Label>
              <Input id="birthDate" name="birthDate" type="date" defaultValue={packet.birthDate ?? ""} />
            </div>
            <div>
              <Label htmlFor="phone">Home telephone</Label>
              <Input id="phone" name="phone" defaultValue={packet.phone ?? ""} />
            </div>
            <div>
              <Label htmlFor="dlNumber">Driver’s license number</Label>
              <Input id="dlNumber" name="dlNumber" defaultValue={packet.dlNumber ?? ""} />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="address1">Permanent street address</Label>
              <Input id="address1" name="address1" defaultValue={packet.address1 ?? ""} />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="address2">Address line 2</Label>
              <Input id="address2" name="address2" defaultValue={packet.address2 ?? ""} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={packet.city ?? ""} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={packet.state ?? "MN"} />
            </div>
            <div>
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" name="zip" defaultValue={packet.zip ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ssn">Social Security number</Label>
              <Input
                id="ssn"
                name="ssn"
                inputMode="numeric"
                autoComplete="off"
                placeholder={packet.ssnLast4 ? `••••••••${packet.ssnLast4}` : "###-##-####"}
                defaultValue=""
              />
              <p className="mt-1 text-xs text-[var(--steel)]">
                Required on the official DPS form (Minn. Stat. 270C.72). Life Star stores only the last 4 digits for
                this prep packet.
                {packet.ssnLast4 ? ` On file: ***-**-${packet.ssnLast4}.` : ""}
              </p>
            </div>
            <div>
              <Label htmlFor="employingSchoolName">Employing commercial school</Label>
              <Input
                id="employingSchoolName"
                name="employingSchoolName"
                defaultValue={packet.employingSchoolName ?? "Life Star Driving School"}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="employingSchoolAddress">School address</Label>
              <Input
                id="employingSchoolAddress"
                name="employingSchoolAddress"
                defaultValue={packet.employingSchoolAddress ?? "7240 Brooklyn Blvd, Minneapolis, MN"}
              />
            </div>
            <div>
              <Label htmlFor="educationProvider">Training provider name</Label>
              <Input
                id="educationProvider"
                name="educationProvider"
                defaultValue={packet.educationProvider ?? "Life Star Driving School"}
              />
            </div>
            <div>
              <Label htmlFor="educationLocation">Provider location</Label>
              <Input
                id="educationLocation"
                name="educationLocation"
                defaultValue={packet.educationLocation ?? "Minnesota main campus"}
              />
            </div>
            <div>
              <Label htmlFor="classroomCompetencyDate">Classroom competencies (7411.0630)</Label>
              <Input
                id="classroomCompetencyDate"
                name="classroomCompetencyDate"
                type="date"
                defaultValue={packet.classroomCompetencyDate ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="laboratoryCompetencyDate">Laboratory competencies (7411.0630)</Label>
              <Input
                id="laboratoryCompetencyDate"
                name="laboratoryCompetencyDate"
                type="date"
                defaultValue={packet.laboratoryCompetencyDate ?? ""}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-[var(--navy)]">Part B — Applicant certification</h2>
          <p className="mt-2 text-sm text-[var(--steel)]">
            Privacy notice (M.S. 13.04, subd. 2): information is collected to process an instructor license; providing
            it is mandatory for processing; incomplete applications may be disapproved and fees are non-refundable.
            School-official attestation is completed by Life Star admin after review.
          </p>
          <label className="mt-4 flex items-start gap-2 text-sm text-[var(--navy)]">
            <input
              type="checkbox"
              name="applicantCertified"
              defaultChecked={packet.applicantCertified}
              className="mt-1"
            />
            I certify that I meet Minnesota instructor qualifications (7411.0620) and driving-history requirements
            (7411.0645).
          </label>
          <label className="mt-3 flex items-start gap-2 text-sm text-[var(--navy)]">
            <input
              type="checkbox"
              name="privacyAcknowledged"
              defaultChecked={packet.privacyAcknowledged}
              className="mt-1"
            />
            I acknowledge the privacy notice (M.S. 13.04) and that incomplete applications may be disapproved with fees
            non-refundable.
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="applicantSignature">Applicant signature (type full name)</Label>
              <Input
                id="applicantSignature"
                name="applicantSignature"
                defaultValue={packet.applicantSignature ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="applicantSignedAt">Date signed</Label>
              <Input
                id="applicantSignedAt"
                name="applicantSignedAt"
                type="date"
                defaultValue={packet.applicantSignedAt ?? ""}
              />
            </div>
          </div>
          {(packet.officialSignature || packet.officialName) && (
            <div className="mt-4 rounded-md bg-[var(--mist)] p-3 text-sm text-[var(--navy)]">
              <p className="font-semibold">Authorized school official (on file)</p>
              <p>
                {packet.officialName} · signed {packet.officialSignedAt || "—"}
              </p>
            </div>
          )}
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" name="intent" value="save">
            Save draft
          </Button>
          <Button type="submit" name="intent" value="submit">
            Submit for Life Star review
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/application/pdf" className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4" /> Download PDF
            </Link>
          </Button>
        </div>
      </form>

      <Card className="mt-8">
        <h2 className="font-display text-xl text-[var(--navy)]">Required attachments</h2>
        <p className="mt-1 text-sm text-[var(--steel)]">
          Upload clear photos or PDFs (private Blob storage, max 4.5MB). Initial-application items as listed on
          PS36008-10.
        </p>
        <ul className="mt-4 space-y-4">
          {APPLICATION_DOC_KINDS.map((k) => {
            const doc = docsByKind[k.kind];
            return (
              <li key={k.kind} className="rounded-lg border border-[var(--navy)]/10 p-3">
                <p className="font-medium text-[var(--navy)]">{k.label}</p>
                <p className="text-xs text-[var(--steel)]">{k.hint}</p>
                {doc ? (
                  <p className="mt-2 text-sm text-emerald-800">
                    On file:{" "}
                    {doc.uploadId ? (
                      <a className="underline" href={`/api/private-uploads/${doc.uploadId}`} target="_blank" rel="noreferrer">
                        {doc.fileName}
                      </a>
                    ) : (
                      doc.fileName
                    )}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-amber-800">Not uploaded yet</p>
                )}
                <form action={uploadAttachment} className="mt-2 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="kind" value={k.kind} />
                  <input
                    type="file"
                    name="file"
                    accept="image/*,application/pdf"
                    required
                    className="text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    {doc ? "Replace" : "Upload"}
                  </Button>
                </form>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
