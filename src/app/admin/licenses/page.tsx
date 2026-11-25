import { redirect } from "next/navigation";
import { IdCard } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function reviewLicense(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const userId = String(formData.get("userId") || "");
  const decision = String(formData.get("decision") || "");
  const adminNote = String(formData.get("adminNote") || "").trim() || null;
  if (!userId || (decision !== "approved" && decision !== "rejected")) {
    redirect("/admin/licenses");
  }
  await prisma.licenseVerification.update({
    where: { userId },
    data: {
      status: decision,
      adminNote,
      reviewedAt: new Date(),
      reviewedById: admin.id,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: `admin.license_${decision}`,
      metaJson: JSON.stringify({ userId, adminNote }),
    },
  });
  redirect("/admin/licenses?ok=1");
}

export default async function AdminLicensesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireUser(["admin"]);
  const params = await searchParams;
  const rows = await prisma.licenseVerification.findMany({
    include: { user: true },
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
  });

  const pending = rows.filter((r) => r.status === "pending");
  const others = rows.filter((r) => r.status !== "pending");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="flex items-center gap-2 text-sm text-[var(--steel)]">
          <IdCard className="h-4 w-4 text-[var(--amber)]" />
          Review candidate driver’s license uploads (private storage).
        </p>
      </div>
      {params.ok && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Review saved.</p>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl text-[var(--navy)]">Pending ({pending.length})</h2>
        {pending.length === 0 && <p className="text-sm text-[var(--steel)]">No pending licenses.</p>}
        {pending.map((r) => (
          <Card key={r.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--navy)]">
                  {r.user.name} · {r.user.email}
                </p>
                <p className="text-sm text-[var(--steel)]">
                  {r.licenseState || "—"} {r.licenseNumber ? `· ${r.licenseNumber}` : ""} · submitted{" "}
                  {r.submittedAt?.toLocaleString() ?? "—"}
                </p>
              </div>
              {r.uploadId && (
                <a
                  href={`/api/private-uploads/${r.uploadId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-[var(--navy)] underline"
                >
                  Open upload
                </a>
              )}
            </div>
            <form action={reviewLicense} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="userId" value={r.userId} />
              <div className="min-w-[200px] flex-1">
                <label className="text-xs text-[var(--steel)]">Admin note</label>
                <Input name="adminNote" placeholder="Optional note to candidate" />
              </div>
              <Button type="submit" name="decision" value="approved" size="sm">
                Approve
              </Button>
              <Button type="submit" name="decision" value="rejected" size="sm" variant="outline">
                Reject
              </Button>
            </form>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-[var(--navy)]">All records</h2>
        {others.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-[var(--navy)]">{r.user.name}</p>
              <p className="text-sm capitalize text-[var(--steel)]">
                {r.status.replaceAll("_", " ")}
                {r.adminNote ? ` · ${r.adminNote}` : ""}
              </p>
            </div>
            {r.uploadId && (
              <a href={`/api/private-uploads/${r.uploadId}`} className="text-sm underline" target="_blank" rel="noreferrer">
                View
              </a>
            )}
          </Card>
        ))}
      </section>
    </div>
  );
}
