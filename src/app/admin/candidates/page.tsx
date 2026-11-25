import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

async function grantLesson(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const userId = String(formData.get("userId") || "");
  const lessonId = String(formData.get("lessonId") || "");
  if (!userId || !lessonId) redirect("/admin/candidates");
  const exists = await prisma.entitlement.findFirst({ where: { userId, lessonId } });
  if (!exists) {
    await prisma.entitlement.create({ data: { userId, lessonId } });
  }
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "admin.grant_lesson",
      metaJson: JSON.stringify({ userId, lessonId }),
    },
  });
  redirect("/admin/candidates?granted=1");
}

async function setCompetency(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const userId = String(formData.get("userId") || "");
  const classroomDate = String(formData.get("classroomDate") || "") || null;
  const laboratoryDate = String(formData.get("laboratoryDate") || "") || null;
  await prisma.competencyRecord.create({
    data: { userId, classroomDate, laboratoryDate, provider: "Life Star Driving School" },
  });
  await prisma.applicationPacket.updateMany({
    where: { userId },
    data: {
      classroomCompetencyDate: classroomDate ?? undefined,
      laboratoryCompetencyDate: laboratoryDate ?? undefined,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "admin.set_competency",
      metaJson: JSON.stringify({ userId, classroomDate, laboratoryDate }),
    },
  });
  redirect("/admin/candidates?comp=1");
}

export default async function AdminCandidatesPage() {
  const [candidates, lessons] = await Promise.all([
    prisma.user.findMany({
      where: { role: "candidate" },
      include: {
        enrollments: { include: { level: true } },
        entitlements: true,
        practicumBookings: true,
        licenseVerification: true,
        schoolLaunchPlan: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lesson.findMany({ orderBy: { sortOrder: "asc" }, take: 20 }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Candidates</h1>
      <div className="mt-6 space-y-4">
        {candidates.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--navy)]">
                  {c.name} · {c.email}
                </p>
                <p className="text-sm text-[var(--steel)]">
                  Level: {c.enrollments[0]?.level.name ?? "—"}
                  {c.enrollments[0]?.enrollmentNumber
                    ? ` · ID ${c.enrollments[0].enrollmentNumber}`
                    : ""}{" "}
                  · Lessons unlocked: {c.entitlements.filter((e) => e.lessonId).length} · Practical credits:{" "}
                  {c.entitlements
                    .filter((e) => e.practicalSkuId)
                    .reduce((s, e) => s + e.creditsRemaining, 0)}
                </p>
                <p className="mt-1 text-sm capitalize text-[var(--steel)]">
                  License: {(c.licenseVerification?.status ?? "not submitted").replaceAll("_", " ")}
                  {c.schoolLaunchPlan
                    ? ` · School launch: ${c.schoolLaunchPlan.status.replaceAll("_", " ")}${
                        c.schoolLaunchPlan.targetState ? ` (${c.schoolLaunchPlan.targetState})` : ""
                      }`
                    : ""}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/candidates/${c.id}/id-card`}>Print ID card</Link>
              </Button>
            </div>
            <form action={grantLesson} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="userId" value={c.id} />
              <div>
                <label className="text-xs text-[var(--steel)]">Grant lesson access</label>
                <select name="lessonId" className="flex h-10 rounded-md border border-[var(--navy)]/15 px-2 text-sm">
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="sm">
                Grant
              </Button>
            </form>
            <form action={setCompetency} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="userId" value={c.id} />
              <div>
                <label className="text-xs text-[var(--steel)]">Classroom date</label>
                <Input name="classroomDate" type="date" />
              </div>
              <div>
                <label className="text-xs text-[var(--steel)]">Laboratory date</label>
                <Input name="laboratoryDate" type="date" />
              </div>
              <Button type="submit" size="sm" variant="outline">
                Record competencies
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
