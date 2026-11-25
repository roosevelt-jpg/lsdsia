import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCertificateForUser, getSchoolCertificateMeta } from "@/lib/certificate";
import { DigitalCertificate } from "@/components/digital-certificate";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function publicOrigin() {
  return (process.env.APP_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "") || "";
}

export default async function CandidateCertificatePage() {
  const session = await requireUser();
  const [cert, meta] = await Promise.all([getCertificateForUser(session.id), getSchoolCertificateMeta()]);
  const origin = publicOrigin();
  const verifyPath = cert ? `/verify/${cert.verificationCode}` : "";
  const verifyUrl = cert ? (origin ? `${origin}${verifyPath}` : verifyPath) : "";

  if (!cert) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl text-[var(--navy)]">Digital certificate</h1>
        <p className="mt-2 text-sm text-[var(--steel)]">
          Your Life Star Instructor Academy certificate appears here after an admin certifies your program completion
          and you have passed the practice exam.
        </p>
        <Card className="mt-6">
          <p className="text-sm text-[var(--steel)]">No certificate issued yet.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/app/quiz">Practice exam</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/app/school-launch">Open a school</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="lsds-certificate-sheet -mx-5 md:-mx-8">
      <div className="lsds-certificate-actions mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 md:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--amber)]">Graduate credential</p>
          <h1 className="font-display text-2xl text-[var(--navy)]">Your digital certificate</h1>
          <p className="mt-1 text-sm text-[var(--steel)]">
            ID {cert.verificationCode} · verify at{" "}
            <Link href={verifyPath} className="text-[var(--navy)] underline">
              {verifyPath}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintButton label="Print / save PDF" />
          <Button asChild size="sm" variant="outline">
            <Link href={verifyPath} target="_blank">
              Open verification
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex justify-center px-2">
        <DigitalCertificate
          data={{
            studentName: cert.studentName,
            enrollmentNumber: cert.enrollmentNumber,
            programName: cert.programName,
            completedAt: cert.completedAt,
            issuedAt: cert.issuedAt,
            verificationCode: cert.verificationCode,
            ownerSignatory: cert.ownerSignatory,
            directorSignatory: cert.directorSignatory,
            schoolName: meta.schoolName,
            registrationId: meta.registrationId,
            operatorLicenseId: meta.operatorLicenseId,
            campusLine: meta.address,
            verifyUrl,
          }}
        />
      </div>

      <p className="lsds-certificate-actions mx-auto mt-6 max-w-2xl px-5 text-center text-xs text-[var(--steel)] md:px-8">
        After certification, graduates worldwide may use Life Star school-launch coaching to prepare to operate their
        own driving school. Use Print / save PDF for a print-ready copy.
      </p>
    </div>
  );
}
