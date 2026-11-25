import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checklistProgress, parseChecklist } from "@/lib/school-launch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function updatePlan(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const planId = String(formData.get("planId") || "");
  const status = String(formData.get("status") || "");
  const adminNote = String(formData.get("adminNote") || "").trim() || null;
  if (!planId) redirect("/admin/school-launch");
  await prisma.schoolLaunchPlan.update({
    where: { id: planId },
    data: {
      ...(status ? { status } : {}),
      adminNote,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "admin.school_launch_update",
      metaJson: JSON.stringify({ planId, status, adminNote }),
    },
  });
  redirect("/admin/school-launch?ok=1");
}

export default async function AdminSchoolLaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireUser(["admin"]);
  const params = await searchParams;
  const plans = await prisma.schoolLaunchPlan.findMany({
    include: {
      user: true,
      documents: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <p className="flex items-center gap-2 text-sm text-[var(--steel)]">
        <Building2 className="h-4 w-4 text-[var(--amber)]" />
        Coach candidates opening a school in their state (guidance + document review).
      </p>
      {params.ok && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Updated.</p>}

      {plans.length === 0 && <p className="text-sm text-[var(--steel)]">No school-launch plans yet.</p>}

      {plans.map((plan) => {
        const progress = checklistProgress(parseChecklist(plan.checklistJson));
        return (
          <Card key={plan.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--navy)]">
                  {plan.user.name} · {plan.user.email}
                </p>
                <p className="text-sm text-[var(--steel)]">
                  {plan.schoolName || "Unnamed school"} · {plan.targetState || "No state"} ·{" "}
                  <span className="capitalize">{plan.status.replaceAll("_", " ")}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--steel)]">
                  Checklist {progress.done}/{progress.total} ({progress.percent}%) · {plan.documents.length} docs
                </p>
              </div>
            </div>
            {plan.documents.length > 0 && (
              <ul className="space-y-1 text-sm">
                {plan.documents.map((d) => (
                  <li key={d.id}>
                    {d.label}
                    {d.uploadId ? (
                      <>
                        {" · "}
                        <a className="underline" href={`/api/private-uploads/${d.uploadId}`} target="_blank" rel="noreferrer">
                          view
                        </a>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <form action={updatePlan} className="flex flex-wrap items-end gap-2 border-t border-[var(--navy)]/8 pt-3">
              <input type="hidden" name="planId" value={plan.id} />
              <div>
                <label className="text-xs text-[var(--steel)]">Status</label>
                <select
                  name="status"
                  defaultValue={plan.status}
                  className="flex h-10 rounded-md border border-[var(--navy)]/15 px-2 text-sm"
                >
                  <option value="not_started">not started</option>
                  <option value="in_progress">in progress</option>
                  <option value="docs_submitted">docs submitted</option>
                  <option value="coaching">coaching</option>
                  <option value="completed">completed</option>
                </select>
              </div>
              <div className="min-w-[200px] flex-1">
                <label className="text-xs text-[var(--steel)]">Coach note</label>
                <Input name="adminNote" defaultValue={plan.adminNote ?? ""} />
              </div>
              <Button type="submit" size="sm">
                Save
              </Button>
            </form>
          </Card>
        );
      })}
    </div>
  );
}
