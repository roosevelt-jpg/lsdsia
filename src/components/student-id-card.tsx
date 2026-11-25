import { format } from "date-fns";
import { code128Svg } from "@/lib/code128";

export type StudentIdCardData = {
  studentName: string;
  enrollmentNumber: string;
  programName: string;
  enrolledAt: Date;
  completedAt: Date | null;
  /** Absolute or relative URL to private photo API, or null */
  photoUrl: string | null;
  /** When true, hide on-screen chrome (print sheet). */
  printMode?: boolean;
};

function formatDate(d: Date) {
  return format(d, "MMM d, yyyy");
}

/**
 * Premium Life Star student identity card — CR80-ish proportions for screen + print.
 */
export function StudentIdCard({ data }: { data: StudentIdCardData }) {
  const barcode = code128Svg(data.enrollmentNumber, { height: 42, moduleWidth: 1.35 });
  const completion = data.completedAt ? formatDate(data.completedAt) : "In progress";

  return (
    <article
      className={`student-id-card relative overflow-hidden text-[var(--navy)] ${
        data.printMode ? "student-id-card--print" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,rgba(230,168,23,0.22),transparent_45%),linear-gradient(135deg,#0b1f33_0%,#0b1f33_42%,#1a2f42_100%)]" />
      <div className="pointer-events-none absolute -right-8 top-10 h-40 w-40 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-2 top-16 h-28 w-28 rounded-full border border-[var(--amber)]/30" />

      <div className="relative flex h-full flex-col p-4 sm:p-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--amber)]">
              Life Star Driving School
            </p>
            <p className="mt-0.5 font-display text-lg leading-tight text-white sm:text-xl">
              Instructor Academy
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/55">Student identity card</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--amber)]/50 bg-white/5">
            <span className="font-display text-sm font-semibold text-[var(--amber)]">LS</span>
          </div>
        </header>

        <div className="mt-4 flex flex-1 gap-4">
          <div className="student-id-photo shrink-0 overflow-hidden rounded-sm bg-[var(--mist)] ring-2 ring-[var(--amber)]/70">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center px-2 text-center text-[10px] text-[var(--steel)]">
                <span className="font-medium text-[var(--navy)]">Photo</span>
                <span>required</span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-white">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">Candidate</p>
            <p className="font-display text-xl leading-tight sm:text-2xl">{data.studentName}</p>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] sm:text-xs">
              <div>
                <dt className="text-white/45">Enrollment no.</dt>
                <dd className="font-mono text-[13px] font-semibold tracking-wide text-[var(--amber)]">
                  {data.enrollmentNumber}
                </dd>
              </div>
              <div>
                <dt className="text-white/45">Program</dt>
                <dd className="font-medium text-white/95">{data.programName}</dd>
              </div>
              <div>
                <dt className="text-white/45">Enrolled</dt>
                <dd className="font-medium text-white/95">{formatDate(data.enrolledAt)}</dd>
              </div>
              <div>
                <dt className="text-white/45">Completed</dt>
                <dd className="font-medium text-white/95">{completion}</dd>
              </div>
            </dl>
          </div>
        </div>

        <footer className="mt-3 border-t border-white/10 pt-3">
          <div
            className="student-id-barcode flex justify-center rounded-sm bg-white px-2 py-1.5"
            dangerouslySetInnerHTML={{ __html: barcode }}
          />
          <p className="mt-1.5 text-center font-mono text-[10px] tracking-[0.18em] text-white/70">
            {data.enrollmentNumber}
          </p>
          <p className="mt-1 text-center text-[9px] text-white/40">
            Present this card for Minnesota campus practical examinations · Life Star worldwide academy
          </p>
        </footer>
      </div>
    </article>
  );
}
