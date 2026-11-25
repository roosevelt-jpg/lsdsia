import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  SCHOOL_DOC_KINDS,
  SCHOOL_LAUNCH_STEPS,
  US_STATES,
  checklistProgress,
  parseChecklist,
} from "@/lib/school-launch";
import { savePrivateUpload } from "@/lib/private-uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function ensurePlan(userId: string) {
  return prisma.schoolLaunchPlan.upsert({
    where: { userId },
    create: { userId, status: "not_started", checklistJson: "{}" },
    update: {},
  });
}

async function savePlan(formData: FormData) {
  "use server";
  const session = await requireUser(["candidate", "admin", "coach"]);
  const targetState = String(formData.get("targetState") || "").toUpperCase() || null;
  const schoolName = String(formData.get("schoolName") || "").trim() || null;
  const plan = await ensurePlan(session.id);
  const checklist = parseChecklist(plan.checklistJson);
  for (const step of SCHOOL_LAUNCH_STEPS) {
    checklist[step.id] = formData.get(`step_${step.id}`) === "on";
  }
  const { percent } = checklistProgress(checklist);
  let status = plan.status;
  if (targetState && status === "not_started") status = "in_progress";
  if (percent >= 100 && status !== "completed") status = "docs_submitted";

  await prisma.schoolLaunchPlan.update({
    where: { id: plan.id },
    data: {
      targetState,
      schoolName,
      checklistJson: JSON.stringify(checklist),
      status,
    },
  });
  redirect("/app/school-launch?saved=1");
}

async function uploadDoc(formData: FormData) {
  "use server";
  const session = await requireUser(["candidate", "admin", "coach"]);
  const kind = String(formData.get("kind") || "other");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    redirect("/app/school-launch?error=" + encodeURIComponent("Choose a file to upload."));
  }
  const plan = await ensurePlan(session.id);
  try {
    const upload = await savePrivateUpload({
      userId: session.id,
      kind: `school_launch_${kind}`,
      file,
    });
    const meta = SCHOOL_DOC_KINDS.find((d) => d.kind === kind);
    await prisma.schoolLaunchDocument.create({
      data: {
        planId: plan.id,
        kind,
        uploadId: upload.id,
        label: meta?.label ?? kind,
      },
    });
    if (plan.status === "not_started" || plan.status === "in_progress") {
      await prisma.schoolLaunchPlan.update({
        where: { id: plan.id },
        data: { status: "docs_submitted" },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    redirect("/app/school-launch?error=" + encodeURIComponent(msg));
  }
  redirect("/app/school-launch?uploaded=1");
}

export default async function SchoolLaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; uploaded?: string; error?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;

  const [plan, lessonsTotal, lessonsDone, bestPass] = await Promise.all([
    ensurePlan(session.id).then(async (p) =>
      prisma.schoolLaunchPlan.findUniqueOrThrow({
        where: { id: p.id },
        include: { documents: { orderBy: { createdAt: "desc" } } },
      }),
    ),
    prisma.lesson.count(),
    prisma.lessonProgress.count({ where: { userId: session.id, completedAt: { not: null } } }),
    prisma.quizAttempt.findFirst({
      where: { userId: session.id, passed: true },
      orderBy: { scorePercent: "desc" },
    }),
  ]);

  const programReady = lessonsTotal > 0 ? lessonsDone >= Math.min(lessonsTotal, 4) || Boolean(bestPass) : true;
  const checklist = parseChecklist(plan.checklistJson);
  const progress = checklistProgress(checklist);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--amber)]">After the program</p>
        <h1 className="mt-2 font-display text-3xl text-[var(--navy)]">Open your driving school</h1>
        <p className="mt-3 text-sm text-[var(--steel)]">
          Life Star helps graduates register a commercial driving school in their chosen U.S. state and prepare the
          DMV / state operator packet. This is coaching and document readiness — not legal advice, and Life Star does
          not file applications with your state for you.
        </p>
      </div>

      {!programReady && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Tip: finish core lessons and a passing practice exam first. You can still start planning your state checklist
          now.
        </p>
      )}
      {params.saved && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Progress saved.</p>}
      {params.uploaded && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Document uploaded privately.</p>
      )}
      {params.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{params.error}</p>}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--steel)]">Plan status</p>
            <p className="font-display text-xl capitalize text-[var(--navy)]">
              {plan.status.replaceAll("_", " ")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--steel)]">Checklist</p>
            <p className="font-display text-xl text-[var(--navy)]">
              {progress.done}/{progress.total} · {progress.percent}%
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--mist)]">
          <div className="h-full rounded-full bg-[var(--amber)]" style={{ width: `${progress.percent}%` }} />
        </div>
      </Card>

      <form action={savePlan} className="space-y-6">
        <Card className="space-y-4">
          <div>
            <Label htmlFor="targetState">Target state</Label>
            <select
              id="targetState"
              name="targetState"
              defaultValue={plan.targetState ?? ""}
              className="mt-1 flex h-10 w-full rounded-md border border-[var(--navy)]/15 bg-white px-3 text-sm"
            >
              <option value="">Select state…</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="schoolName">Working school name</Label>
            <Input id="schoolName" name="schoolName" defaultValue={plan.schoolName ?? ""} placeholder="e.g. North Star Driver Training LLC" />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-display text-xl text-[var(--navy)]">State readiness checklist</h2>
          {SCHOOL_LAUNCH_STEPS.map((step) => (
            <label key={step.id} className="flex gap-3 rounded-lg bg-[var(--mist)]/70 p-3">
              <input
                type="checkbox"
                name={`step_${step.id}`}
                defaultChecked={Boolean(checklist[step.id])}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-[var(--navy)]">{step.title}</span>
                <span className="mt-1 block text-sm text-[var(--steel)]">{step.body}</span>
              </span>
            </label>
          ))}
          <Button type="submit">Save progress</Button>
        </Card>
      </form>

      <Card className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Document uploads</h2>
        <p className="text-sm text-[var(--steel)]">
          Upload drafts and supporting files for Life Star coaching review. Stored privately — not on a public path.
        </p>
        <form action={uploadDoc} className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="kind">Document type</Label>
            <select
              id="kind"
              name="kind"
              className="mt-1 flex h-10 rounded-md border border-[var(--navy)]/15 bg-white px-3 text-sm"
            >
              {SCHOOL_DOC_KINDS.map((d) => (
                <option key={d.kind} value={d.kind}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" accept="image/*,application/pdf" required />
          </div>
          <Button type="submit" size="sm">
            Upload
          </Button>
        </form>
        <ul className="divide-y divide-[var(--navy)]/8">
          {plan.documents.length === 0 && (
            <li className="py-2 text-sm text-[var(--steel)]">No documents uploaded yet.</li>
          )}
          {plan.documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-[var(--navy)]">{d.label}</span>
              {d.uploadId ? (
                <a className="underline" href={`/api/private-uploads/${d.uploadId}`} target="_blank" rel="noreferrer">
                  View
                </a>
              ) : (
                <span className="text-[var(--steel)]">—</span>
              )}
            </li>
          ))}
        </ul>
        {plan.adminNote && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">Coach note: {plan.adminNote}</p>
        )}
      </Card>
    </div>
  );
}
