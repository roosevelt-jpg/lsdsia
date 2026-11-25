"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ApplicationRow = {
  id: string;
  name: string;
  program: string;
  dateLabel: string;
  status: string;
  href: string;
  action: string;
};

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("approved") || s === "paid" || s === "verified") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (s.includes("document") || s.includes("rejected") || s.includes("required") || s === "failed") {
    return "bg-red-50 text-red-700";
  }
  return "bg-amber-50 text-amber-700";
}

export function RecentApplicationsTable({
  rows,
  title,
  subtitle,
  viewAllLabel,
  viewAllHref,
  programFilterLabel,
  statusFilterLabel,
}: {
  rows: ApplicationRow[];
  title: string;
  subtitle: string;
  viewAllLabel: string;
  viewAllHref: string;
  programFilterLabel: string;
  statusFilterLabel: string;
}) {
  const programs = useMemo(
    () => Array.from(new Set(rows.map((r) => r.program))).sort(),
    [rows],
  );
  const statuses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status))).sort(),
    [rows],
  );
  const [program, setProgram] = useState("");
  const [status, setStatus] = useState("");

  const filtered = rows.filter((r) => {
    if (program && r.program !== program) return false;
    if (status && r.status !== status) return false;
    return true;
  });

  return (
    <section className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(43,108,176,0.08)] ring-1 ring-[#2b6cb0]/8">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--navy)]">{title}</h3>
          <p className="text-xs text-[var(--steel)]">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="h-9 rounded-lg border border-[var(--navy)]/12 bg-[#f4f7fb] px-2.5 text-xs font-semibold text-[var(--navy)]"
          >
            <option value="">{programFilterLabel}</option>
            {programs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-lg border border-[var(--navy)]/12 bg-[#f4f7fb] px-2.5 text-xs font-semibold text-[var(--navy)]"
          >
            <option value="">{statusFilterLabel}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Link href={viewAllHref} className="text-sm font-semibold text-[#2b6cb0] hover:underline">
            {viewAllLabel} →
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--navy)]/8 text-[11px] uppercase tracking-wide text-[var(--steel)]">
              <th className="pb-2 font-semibold">Applicant</th>
              <th className="pb-2 font-semibold">Program</th>
              <th className="pb-2 font-semibold">Date Applied</th>
              <th className="pb-2 font-semibold">Status</th>
              <th className="pb-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-[var(--steel)]">
                  No applications match these filters.
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-[var(--navy)]/6">
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--navy)] text-[10px] font-bold text-white">
                      {a.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase() ?? "")
                        .join("")}
                    </span>
                    <span className="font-semibold text-[var(--navy)]">{a.name}</span>
                  </div>
                </td>
                <td className="py-3 text-[var(--steel)]">{a.program}</td>
                <td className="py-3 text-[var(--steel)]">{a.dateLabel}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(a.status)}`}>
                    {a.status}
                  </span>
                </td>
                <td className="py-3">
                  <Link href={a.href} className="text-sm font-semibold text-[#2b6cb0] hover:underline">
                    {a.action}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
