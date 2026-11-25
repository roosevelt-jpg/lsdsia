import { format } from "date-fns";
import { CERTIFICATE_BRAND } from "@/lib/certificate-brand";

export type DigitalCertificateData = {
  studentName: string;
  enrollmentNumber: string;
  programName: string;
  completedAt: Date;
  issuedAt: Date;
  verificationCode: string;
  ownerSignatory: string;
  directorSignatory: string;
  schoolName: string;
  registrationId: string;
  operatorLicenseId: string;
  campusLine?: string;
  verifyUrl?: string;
};

export function DigitalCertificate({ data }: { data: DigitalCertificateData }) {
  const completed = format(data.completedAt, "MMMM d, yyyy");
  const issued = format(data.issuedAt, "MMMM d, yyyy");

  return (
    <article className="lsds-certificate relative overflow-hidden bg-[var(--snow)] text-[var(--navy)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(230,168,23,0.14),transparent_55%),linear-gradient(180deg,rgba(11,31,51,0.04),transparent_40%)]" />
      <div className="lsds-certificate-frame absolute inset-3 border border-[var(--navy)]/25 sm:inset-4" />
      <div className="lsds-certificate-frame absolute inset-4 border border-[var(--amber)]/50 sm:inset-5" />

      <div className="relative flex h-full flex-col px-6 py-7 sm:px-10 sm:py-9">
        <header className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--amber)] sm:text-[11px]">
            {data.schoolName}
          </p>
          <h1 className="mt-2 font-display text-2xl leading-tight text-[var(--navy)] sm:text-4xl">
            Certificate of Completion
          </h1>
          <p className="mt-1 text-sm text-[var(--steel)] sm:text-base">{CERTIFICATE_BRAND.academyName}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--steel)]">
            {CERTIFICATE_BRAND.worldwideLine}
          </p>
        </header>

        <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center sm:mt-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--steel)]">This certifies that</p>
          <p className="mt-2 font-display text-3xl text-[var(--navy)] sm:text-5xl">{data.studentName}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--steel)] sm:text-base">
            has successfully completed the <strong className="text-[var(--navy)]">{data.programName}</strong>{" "}
            program of the Life Star Driving School Instructor Academy, including required examinations, and is
            recognized as a graduate eligible to pursue instructor licensing and school-launch pathways.
          </p>

          <dl className="mt-6 grid w-full max-w-xl grid-cols-2 gap-3 text-left text-xs sm:text-sm">
            <div className="rounded-md bg-white/70 px-3 py-2 ring-1 ring-[var(--navy)]/10">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--steel)]">Enrollment no.</dt>
              <dd className="mt-0.5 font-mono font-semibold tracking-wide">{data.enrollmentNumber}</dd>
            </div>
            <div className="rounded-md bg-white/70 px-3 py-2 ring-1 ring-[var(--navy)]/10">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--steel)]">Completion date</dt>
              <dd className="mt-0.5 font-medium">{completed}</dd>
            </div>
            <div className="rounded-md bg-white/70 px-3 py-2 ring-1 ring-[var(--navy)]/10">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--steel)]">Certificate ID</dt>
              <dd className="mt-0.5 font-mono font-semibold tracking-wide">{data.verificationCode}</dd>
            </div>
            <div className="rounded-md bg-white/70 px-3 py-2 ring-1 ring-[var(--navy)]/10">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--steel)]">Issued</dt>
              <dd className="mt-0.5 font-medium">{issued}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:mt-8 sm:gap-10">
          <div className="text-center">
            <p className="font-display text-lg italic text-[var(--navy)] sm:text-xl">{data.ownerSignatory}</p>
            <div className="mx-auto mt-1 h-px w-28 bg-[var(--navy)]/30 sm:w-36" />
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--steel)]">
              {CERTIFICATE_BRAND.ownerTitle}
            </p>
            <p className="text-[10px] text-[var(--steel)]">{data.schoolName}</p>
          </div>
          <div className="text-center">
            <p className="font-display text-lg italic text-[var(--navy)] sm:text-xl">{data.directorSignatory}</p>
            <div className="mx-auto mt-1 h-px w-28 bg-[var(--navy)]/30 sm:w-36" />
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--steel)]">
              {CERTIFICATE_BRAND.directorTitle}
            </p>
            <p className="text-[10px] text-[var(--steel)]">{CERTIFICATE_BRAND.academyName}</p>
          </div>
        </div>

        <footer className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--navy)]/10 pt-4">
          <div className="flex gap-3">
            <div className="lsds-seal flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-[var(--amber)] bg-[var(--navy)] text-center text-[var(--amber)]">
              <span className="text-[8px] font-semibold uppercase leading-tight tracking-wide">LSDS</span>
              <span className="text-[7px] uppercase leading-tight text-white/80">Seal</span>
            </div>
            <div className="lsds-seal flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-[var(--navy)]/40 bg-white text-center text-[var(--navy)]">
              <span className="text-[7px] font-semibold uppercase leading-tight tracking-wide">Auth</span>
              <span className="text-[7px] uppercase leading-tight text-[var(--steel)]">Credential</span>
            </div>
          </div>
          <div className="max-w-sm text-right text-[9px] leading-relaxed text-[var(--steel)] sm:text-[10px]">
            <p className="font-medium text-[var(--navy)]">{CERTIFICATE_BRAND.sealPrimary}</p>
            <p>{data.campusLine || CERTIFICATE_BRAND.campusLine}</p>
            <p>
              Registration {data.registrationId} · Operator {data.operatorLicenseId}
            </p>
            {data.verifyUrl && <p className="mt-0.5 font-mono">Verify: {data.verifyUrl}</p>}
          </div>
        </footer>
      </div>
    </article>
  );
}
