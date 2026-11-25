import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { loadCmsSite } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  await requireUser();
  const site = await loadCmsSite();
  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-[var(--navy)]/8">
      <h1 className="text-2xl font-bold text-[var(--navy)]">Support</h1>
      <p className="mt-2 text-sm text-[var(--steel)]">
        Life Star Instructors Academy support for candidates worldwide. Campus practicals are delivered in Minnesota.
      </p>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-[var(--navy)]">Email</dt>
          <dd>
            <a className="text-[#2b6cb0] underline" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--navy)]">Phone</dt>
          <dd>
            <a className="text-[#2b6cb0] underline" href={`tel:${site.contactPhone}`}>
              {site.contactPhone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--navy)]">Campus</dt>
          <dd className="text-[var(--steel)]">{site.contactAddress}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--navy)]">Owner</dt>
          <dd className="text-[var(--steel)]">{site.ownerName}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/app/practicum" className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-bold text-white">
          Book practical training
        </Link>
        <Link href="/app/resources" className="rounded-lg border border-[var(--navy)]/15 px-4 py-2 text-sm font-semibold text-[var(--navy)]">
          Resources
        </Link>
      </div>
    </div>
  );
}
