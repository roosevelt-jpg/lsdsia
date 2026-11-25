import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { certifyAndMaybeIssueCertificate, getCertificateForUser } from "@/lib/certificate";
import { loadStudentIdPayload } from "@/lib/student-id";
import { StudentIdCard } from "@/components/student-id-card";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

async function markCertified(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const userId = String(formData.get("userId") || "");
  const enrollmentId = String(formData.get("enrollmentId") || "");
  if (!userId || !enrollmentId) redirect(`/admin/candidates/${userId}/id-card`);

  const { issued } = await certifyAndMaybeIssueCertificate({
    userId,
    enrollmentId,
    adminId: admin.id,
  });

  if (issued.ok) {
    redirect(`/admin/candidates/${userId}/id-card?certified=1&cert=1`);
  }
  redirect(
    `/admin/candidates/${userId}/id-card?certified=1&certError=${encodeURIComponent(issued.error)}`,
  );
}

export default async function AdminStudentIdCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ certified?: string; cert?: string; certError?: string }>;
}) {
  await requireUser(["admin"]);
  const { id } = await params;
  const sp = await searchParams;
  const payload = await loadStudentIdPayload(id);
  if (!payload || payload.user.role !== "candidate") notFound();

  const { user, enrollment, profile } = payload;
  const existingCert = await getCertificateForUser(user.id);

  if (!enrollment) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-2xl text-[var(--navy)]">Student ID card</h1>
        <p className="mt-2 text-sm text-[var(--steel)]">
          {user.name} has no enrollment yet — assign a level before printing an ID card.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/admin/candidates">Back to candidates</Link>
        </Button>
      </div>
    );
  }

  const photoUrl = profile?.idPhotoUploadId
    ? `/api/private-uploads/${profile.idPhotoUploadId}`
    : profile?.avatarUrl || null;

  return (
    <div className="student-id-print-sheet mx-auto max-w-3xl">
      <div className="student-id-print-actions space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--steel)]">Minnesota campus visits</p>
            <h1 className="font-display text-2xl text-[var(--navy)]">Print student ID</h1>
            <p className="mt-1 text-sm text-[var(--steel)]">
              {user.name} · {user.email} · {enrollment.enrollmentNumber}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PrintButton />
            {existingCert && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/verify/${existingCert.verificationCode}`}>View certificate</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/candidates">Candidates</Link>
            </Button>
          </div>
        </div>
        {sp.certified && (
          <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
            Enrollment marked certified — completion date set on the card.
            {sp.cert ? " Digital certificate auto-issued." : ""}
          </p>
        )}
        {sp.certError && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
            Certificate not issued: {sp.certError}
          </p>
        )}
        {!profile?.idPhotoUploadId && !profile?.avatarUrl && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
            No ID photo on file. Ask the candidate to upload a passport-style photo from their dashboard before campus
            exams.
          </p>
        )}
        {enrollment.status !== "completed" && (
          <form action={markCertified}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="enrollmentId" value={enrollment.id} />
            <Button type="submit" size="sm" variant="outline">
              Mark program certified
            </Button>
          </form>
        )}
      </div>

      <div className="flex justify-center">
        <StudentIdCard
          data={{
            studentName: user.name,
            enrollmentNumber: enrollment.enrollmentNumber,
            programName: enrollment.level.name,
            enrolledAt: enrollment.startedAt,
            completedAt: enrollment.completedAt,
            photoUrl,
            printMode: true,
          }}
        />
      </div>
      <p className="student-id-print-actions mt-6 text-center text-xs text-[var(--steel)]">
        Cut to CR80 (3.375″ × 2.125″) or laminate as issued. Barcode encodes the enrollment number for campus check-in.
      </p>
    </div>
  );
}
