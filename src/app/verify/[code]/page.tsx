import Link from "next/link";
import { format } from "date-fns";
import { getCertificateByVerificationCode, getSchoolCertificateMeta } from "@/lib/certificate";
import { DigitalCertificate } from "@/components/digital-certificate";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function publicOrigin() {
  return (process.env.APP_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "") || "";
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [cert, meta] = await Promise.all([
    getCertificateByVerificationCode(decodeURIComponent(code)),
    getSchoolCertificateMeta(),
  ]);
  const origin = publicOrigin();
  const verifyPath = `/verify/${(cert?.verificationCode || code).toUpperCase()}`;
  const verifyUrl = origin ? `${origin}${verifyPath}` : verifyPath;

  return (
    <main className="min-h-screen bg-[var(--mist)]">
      <header className="border-b border-white/10 bg-[var(--navy)] text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link href="/" className="font-display text-lg tracking-wide">
            Life Star Driving School
          </Link>
          <Link href="/login" className="text-sm text-white/80 hover:text-white">
            Log in
          </Link>
        </div>
        <div className="mx-auto max-w-4xl px-5 pb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--amber)]">Certificate verification</p>
          <h1 className="mt-2 font-display text-3xl">Authenticate an LSDS credential</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/75">
            Public authenticity check for Instructor Academy digital certificates. Graduates worldwide may share this
            link with employers and licensing bodies.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10">
        {!cert || cert.revokedAt ? (
          <div className="rounded-xl bg-white p-8 ring-1 ring-[var(--navy)]/10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">Not valid</p>
            <h2 className="mt-2 font-display text-2xl text-[var(--navy)]">
              {cert?.revokedAt ? "Certificate revoked" : "Certificate not found"}
            </h2>
            <p className="mt-2 text-sm text-[var(--steel)]">
              No active Life Star certificate matches code{" "}
              <span className="font-mono text-[var(--navy)]">{code}</span>.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/">Back to Life Star</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-950">
              <p className="text-sm font-semibold uppercase tracking-[0.14em]">Verified authentic</p>
              <p className="mt-1 text-sm">
                Issued {format(cert.issuedAt, "MMMM d, yyyy")} to <strong>{cert.studentName}</strong> · program{" "}
                <strong>{cert.programName}</strong> · enrollment <strong>{cert.enrollmentNumber}</strong>
              </p>
            </div>

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
        )}
      </div>
    </main>
  );
}
