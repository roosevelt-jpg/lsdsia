import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { APPLICATION_DOC_KINDS } from "@/lib/application";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function reviewPacket(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const packetId = String(formData.get("packetId") || "");
  const decision = String(formData.get("decision") || "");
  const adminNote = String(formData.get("adminNote") || "").trim() || null;
  const officialName = String(formData.get("officialName") || "").trim() || admin.name;
  const officialSignature = String(formData.get("officialSignature") || "").trim() || officialName;
  const officialSignedAt =
    String(formData.get("officialSignedAt") || "").trim() || new Date().toISOString().slice(0, 10);

  if (!packetId || !["under_review", "approved", "rejected", "attest"].includes(decision)) {
    redirect("/admin/applications");
  }

  const packet = await prisma.applicationPacket.findUnique({ where: { id: packetId } });
  if (!packet) redirect("/admin/applications");

  const nextStatus =
    decision === "approved"
      ? "approved"
      : decision === "rejected"
        ? "rejected"
        : decision === "under_review"
          ? "under_review"
          : packet.status === "draft"
            ? "under_review"
            : packet.status;

  await prisma.applicationPacket.update({
    where: { id: packetId },
    data: {
      status: nextStatus,
      adminNote,
      ...(decision === "attest" || decision === "approved"
        ? { officialName, officialSignature, officialSignedAt, officialUserId: admin.id }
        : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: `admin.application_${decision}`,
      metaJson: JSON.stringify({ packetId, userId: packet.userId }),
    },
  });
  redirect("/admin/applications?ok=1");
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireUser(["admin"]);
  const params = await searchParams;

  const packets = await prisma.applicationPacket.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      documents: true,
    },
    orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="flex items-center gap-2 text-sm text-[var(--steel)]">
          <FileText className="h-4 w-4 text-[var(--amber)]" />
          PS36008-10 preparation packets — review attachments and attest as authorized school official
        </p>
        <h1 className="font-display text-3xl text-[var(--navy)]">Instructor applications</h1>
        <p className="mt-1 text-sm text-[var(--steel)]">
          ID / license document review remains at{" "}
          <Link href="/admin/licenses" className="underline">
            Licenses
          </Link>
          .
        </p>
      </div>

      {params.ok && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Application updated.</p>
      )}

      {packets.length === 0 && (
        <Card>
          <p className="text-sm text-[var(--steel)]">No application packets yet.</p>
        </Card>
      )}

      {packets.map((p) => (
        <Card key={p.id} className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-[var(--navy)]">
                {p.fullName || p.user.name} · {p.user.email}
              </p>
              <p className="text-xs text-[var(--steel)]">
                Completeness {p.completenessPercent}% · status{" "}
                <span className="capitalize">{p.status.replace(/_/g, " ")}</span>
                {p.submittedAt ? ` · submitted ${p.submittedAt.toLocaleString()}` : ""}
              </p>
            </div>
            <Link href={`/admin/candidates`} className="text-sm underline">
              Candidate record
            </Link>
          </div>

          <dl className="grid gap-1 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--steel)]">Name</dt>
              <dd>
                {[p.lastName, p.firstName, p.middleName].filter(Boolean).join(", ") || p.fullName || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--steel)]">DL / phone</dt>
              <dd>
                {p.dlNumber || "—"} · {p.phone || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--steel)]">Classroom / lab dates</dt>
              <dd>
                {p.classroomCompetencyDate || "—"} / {p.laboratoryCompetencyDate || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--steel)]">Applicant signed</dt>
              <dd>
                {p.applicantSignature || "—"} · {p.applicantSignedAt || "—"}
              </dd>
            </div>
          </dl>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--steel)]">Attachments</p>
            <ul className="mt-1 space-y-1 text-sm">
              {APPLICATION_DOC_KINDS.map((k) => {
                const doc = p.documents.find((d) => d.kind === k.kind);
                return (
                  <li key={k.kind}>
                    {doc?.uploadId ? (
                      <a
                        className="underline"
                        href={`/api/private-uploads/${doc.uploadId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {k.label}: {doc.fileName}
                      </a>
                    ) : (
                      <span className="text-amber-800">{k.label}: missing</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {p.officialSignature && (
            <p className="text-sm text-emerald-800">
              Official attestation: {p.officialName} · {p.officialSignedAt}
            </p>
          )}
          {p.adminNote && <p className="text-sm text-[var(--steel)]">Note: {p.adminNote}</p>}

          <form action={reviewPacket} className="grid gap-3 border-t border-[var(--navy)]/10 pt-3 sm:grid-cols-2">
            <input type="hidden" name="packetId" value={p.id} />
            <div className="sm:col-span-2">
              <Label htmlFor={`note-${p.id}`}>Admin note</Label>
              <Input id={`note-${p.id}`} name="adminNote" defaultValue={p.adminNote ?? ""} />
            </div>
            <div>
              <Label htmlFor={`oname-${p.id}`}>Authorized official name</Label>
              <Input
                id={`oname-${p.id}`}
                name="officialName"
                defaultValue={p.officialName ?? "John Addo"}
              />
            </div>
            <div>
              <Label htmlFor={`osig-${p.id}`}>Official signature (type name)</Label>
              <Input
                id={`osig-${p.id}`}
                name="officialSignature"
                defaultValue={p.officialSignature ?? ""}
              />
            </div>
            <div>
              <Label htmlFor={`odate-${p.id}`}>Official date</Label>
              <Input
                id={`odate-${p.id}`}
                name="officialSignedAt"
                type="date"
                defaultValue={p.officialSignedAt ?? ""}
              />
            </div>
            <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
              <Button type="submit" name="decision" value="under_review" variant="outline" size="sm">
                Mark under review
              </Button>
              <Button type="submit" name="decision" value="attest" variant="outline" size="sm">
                Save official attestation
              </Button>
              <Button type="submit" name="decision" value="approved" size="sm">
                Approve packet
              </Button>
              <Button type="submit" name="decision" value="rejected" variant="outline" size="sm">
                Reject
              </Button>
            </div>
          </form>
        </Card>
      ))}
    </div>
  );
}
