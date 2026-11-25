import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { savePrivateUpload } from "@/lib/private-uploads";
import { getCertificateForUser } from "@/lib/certificate";
import { loadStudentIdPayload } from "@/lib/student-id";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StudentIdCard } from "@/components/student-id-card";

export const dynamic = "force-dynamic";

async function uploadIdPhoto(formData: FormData) {
  "use server";
  const session = await requireUser(["candidate", "admin", "coach"]);
  const file = formData.get("idPhoto");
  if (!(file instanceof File) || file.size <= 0) {
    redirect("/app?photoError=" + encodeURIComponent("Choose a passport-style photo to upload."));
  }
  if (!file.type.startsWith("image/")) {
    redirect("/app?photoError=" + encodeURIComponent("ID photo must be an image (JPG or PNG)."));
  }
  try {
    const upload = await savePrivateUpload({
      userId: session.id,
      kind: "student_id_photo",
      file,
    });
    await prisma.profile.upsert({
      where: { userId: session.id },
      create: { userId: session.id, idPhotoUploadId: upload.id },
      update: { idPhotoUploadId: upload.id },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "student_id.photo_uploaded",
        metaJson: JSON.stringify({ uploadId: upload.id }),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    redirect("/app?photoError=" + encodeURIComponent(msg));
  }
  redirect("/app?photoOk=1");
}

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ photoError?: string; photoOk?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      enrollments: { include: { level: true }, orderBy: { startedAt: "desc" }, take: 1 },
      entitlements: true,
      lessonProgress: true,
      quizAttempts: { where: { submittedAt: { not: null } }, orderBy: { submittedAt: "desc" }, take: 5 },
      applicationPacket: true,
      orders: { orderBy: { createdAt: "desc" }, take: 5 },
      licenseVerification: true,
      schoolLaunchPlan: true,
      profile: true,
    },
  });

  const [idPayload, certificate] = await Promise.all([
    loadStudentIdPayload(session.id),
    getCertificateForUser(session.id),
  ]);
  const enrollment = idPayload?.enrollment ?? user?.enrollments[0] ?? null;
  const lessonEntitlements = user?.entitlements.filter((e) => e.lessonId) ?? [];
  const practicalCredits =
    user?.entitlements
      .filter((e) => e.practicalSkuId)
      .reduce((s, e) => s + e.creditsRemaining, 0) ?? 0;
  const completedLessons = user?.lessonProgress.filter((p) => p.completedAt).length ?? 0;
  const bestQuiz = user?.quizAttempts.reduce(
    (best, a) => Math.max(best, a.scorePercent ?? 0),
    0
  );
  const appPct = user?.applicationPacket?.completenessPercent ?? 0;
  const licenseStatus = user?.licenseVerification?.status ?? "not_submitted";
  const photoUrl = user?.profile?.idPhotoUploadId
    ? `/api/private-uploads/${user.profile.idPhotoUploadId}`
    : null;

  let nextAction = { label: "Choose an enrollment level", href: "/app/enroll" };
  if (licenseStatus === "not_submitted") {
    nextAction = { label: "Upload your driver’s license for verification", href: "/app/onboarding/license" };
  } else if (licenseStatus === "rejected") {
    nextAction = { label: "Re-submit your driver’s license", href: "/app/onboarding/license" };
  } else if (!enrollment) {
    nextAction = { label: "Choose an enrollment level", href: "/app/enroll" };
  } else if (!photoUrl) {
    nextAction = { label: "Add your student ID photo", href: "/app#student-id" };
  } else if (lessonEntitlements.length === 0) {
    nextAction = { label: "Buy your first online lesson or package", href: "/app/store" };
  } else if (completedLessons < lessonEntitlements.length) {
    nextAction = { label: "Continue learning", href: "/app/learn" };
  } else if ((bestQuiz ?? 0) < 80) {
    nextAction = { label: "Take the practice exam", href: "/app/quiz" };
  } else if (appPct < 80) {
    nextAction = { label: "Complete your application packet", href: "/app/application" };
  } else if (practicalCredits < 1) {
    nextAction = { label: "Purchase Minnesota campus practical credit", href: "/app/store" };
  } else if (certificate) {
    nextAction = {
      label: "View your digital certificate — then plan opening your school",
      href: "/app/certificate",
    };
  } else if ((bestQuiz ?? 0) >= 80 && completedLessons >= Math.min(lessonEntitlements.length, 4)) {
    nextAction = {
      label: "Plan opening your driving school after certification",
      href: "/app/school-launch",
    };
  } else {
    nextAction = { label: "Request a Minnesota campus practicum date", href: "/app/practicum" };
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade">
      <h1 className="font-display text-3xl text-[var(--navy)]">Candidate dashboard</h1>
      <p className="mt-2 text-[var(--steel)]">
        Welcome back, {session.name}. Life Star Instructor Academy serves students worldwide — study online, then
        complete campus practicals in Minnesota when you are ready.
      </p>

      <section id="student-id" className="mt-8 scroll-mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--amber)]">Your credentials</p>
            <h2 className="font-display text-2xl text-[var(--navy)]">Student identity card</h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--steel)]">
              Carry this Life Star ID for Minnesota campus examinations. After certification, graduates can return to
              open their own driving school with Life Star coaching.
            </p>
          </div>
        </div>

        {params.photoError && (
          <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{params.photoError}</p>
        )}
        {params.photoOk && (
          <p className="mb-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            ID photo saved privately.
          </p>
        )}

        {enrollment ? (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <StudentIdCard
              data={{
                studentName: session.name,
                enrollmentNumber: enrollment.enrollmentNumber,
                programName: enrollment.level.name,
                enrolledAt: enrollment.startedAt,
                completedAt: enrollment.completedAt,
                photoUrl,
              }}
            />
            {!photoUrl && (
              <form
                action={uploadIdPhoto}
                className="max-w-sm rounded-lg border border-dashed border-[var(--navy)]/20 bg-white p-5"
              >
                <p className="font-medium text-[var(--navy)]">Add passport-style photo</p>
                <p className="mt-1 text-xs text-[var(--steel)]">
                  Clear head-and-shoulders image, JPG/PNG, under 900KB. Stored privately — not on a public URL.
                </p>
                <input
                  name="idPhoto"
                  type="file"
                  accept="image/*"
                  required
                  className="mt-3 block w-full text-sm text-[var(--steel)]"
                />
                <Button type="submit" size="sm" className="mt-3">
                  Upload photo
                </Button>
              </form>
            )}
            {photoUrl && (
              <form action={uploadIdPhoto} className="max-w-sm text-sm text-[var(--steel)]">
                <p>Replace ID photo</p>
                <input name="idPhoto" type="file" accept="image/*" required className="mt-2 block w-full text-sm" />
                <Button type="submit" size="sm" variant="outline" className="mt-2">
                  Replace
                </Button>
              </form>
            )}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-[var(--steel)]">
              Select an enrollment level to issue your Life Star student identity number and card.
            </p>
            <Button asChild className="mt-3" size="sm">
              <Link href="/app/enroll">Choose enrollment level</Link>
            </Button>
          </Card>
        )}
      </section>

      <Card className="mt-8 border-[var(--amber)]/40 bg-[var(--navy)] text-white">
        <p className="text-sm uppercase tracking-wide text-[var(--amber)]">Next action</p>
        <p className="mt-2 font-display text-2xl">{nextAction.label}</p>
        <Button asChild className="mt-4" variant="default">
          <Link href={nextAction.href}>Continue</Link>
        </Button>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-[var(--steel)]">Enrollment level</p>
          <p className="mt-1 font-display text-xl text-[var(--navy)]">
            {enrollment?.level.name ?? "Not enrolled"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">Unlocked lessons</p>
          <p className="mt-1 font-display text-xl text-[var(--navy)]">
            {lessonEntitlements.length} · {completedLessons} completed
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">Best practice exam</p>
          <p className="mt-1 font-display text-xl text-[var(--navy)]">
            {bestQuiz != null && user?.quizAttempts.length ? `${bestQuiz}%` : "Not attempted"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">Application · MN practical credits</p>
          <p className="mt-1 font-display text-xl text-[var(--navy)]">
            {appPct}% · {practicalCredits} credit{practicalCredits === 1 ? "" : "s"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">License verification</p>
          <p className="mt-1 font-display text-xl capitalize text-[var(--navy)]">
            {licenseStatus.replaceAll("_", " ")}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">School launch</p>
          <p className="mt-1 font-display text-xl capitalize text-[var(--navy)]">
            {(user?.schoolLaunchPlan?.status ?? "not started").replaceAll("_", " ")}
            {user?.schoolLaunchPlan?.targetState ? ` · ${user.schoolLaunchPlan.targetState}` : ""}
          </p>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--navy)]">Recent orders</h2>
        <ul className="mt-3 space-y-2">
          {(user?.orders.length ?? 0) === 0 && (
            <li className="text-sm text-[var(--steel)]">No orders yet. Visit the store to purchase.</li>
          )}
          {user?.orders.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between rounded-md bg-white px-4 py-3 text-sm ring-1 ring-[var(--navy)]/10"
            >
              <span className="capitalize text-[var(--navy)]">{o.status}</span>
              <span className="text-[var(--steel)]">{formatUsd(o.totalCents)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
