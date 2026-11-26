"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type CalendarSession = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  kind: string;
  location: string;
  instructorName: string | null;
  capacity: number;
  bookingCount: number;
  confirmedCount: number;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function kindTone(kind: string) {
  switch (kind) {
    case "class":
      return "bg-[#2b6cb0] text-white";
    case "campus":
      return "bg-emerald-700 text-white";
    case "info":
      return "bg-[var(--amber)] text-[var(--navy-deep)]";
    default:
      return "bg-[var(--navy-deep)] text-white";
  }
}

function spansDay(session: CalendarSession, ymd: string) {
  return session.startDate <= ymd && ymd <= session.endDate;
}

export function ScheduleCalendar({
  sessions,
  initialMonth,
}: {
  sessions: CalendarSession[];
  initialMonth?: string; // YYYY-MM
}) {
  const start = initialMonth
    ? parseYmd(`${initialMonth}-01`)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [cursor, setCursor] = useState(start);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: { date: Date | null; ymd: string | null }[] = [];
    for (let i = 0; i < startPad; i++) out.push({ date: null, ymd: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      out.push({ date, ymd: toYmd(date) });
    }
    while (out.length % 7 !== 0) out.push({ date: null, ymd: null });
    return out;
  }, [year, month]);

  const selected = sessions.find((s) => s.id === selectedId) ?? null;
  const today = toYmd(new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-2xl border border-[var(--navy)]/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy)]/8 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--steel)]">Scheduling</p>
            <h2 className="font-display text-xl text-[var(--navy)]">{monthLabel}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-[var(--navy)]/15 px-3 py-1.5 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--mist)]"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-lg border border-[var(--navy)]/15 px-3 py-1.5 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--mist)]"
              onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            >
              Today
            </button>
            <button
              type="button"
              className="rounded-lg border border-[var(--navy)]/15 px-3 py-1.5 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--mist)]"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-[var(--navy)]/8 bg-[#f7f9fc] text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--steel)]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-1 py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(96px,1fr)]">
          {cells.map((cell, i) => {
            if (!cell.ymd || !cell.date) {
              return <div key={`pad-${i}`} className="border-b border-r border-[var(--navy)]/6 bg-[#fafbfc]" />;
            }
            const daySessions = sessions.filter((s) => spansDay(s, cell.ymd!));
            const isToday = cell.ymd === today;
            return (
              <div
                key={cell.ymd}
                className={`min-h-[96px] border-b border-r border-[var(--navy)]/6 p-1.5 ${
                  isToday ? "bg-[#eef5ff]" : "bg-white"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday ? "bg-[#2b6cb0] text-white" : "text-[var(--navy)]"
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  {daySessions.length > 0 && (
                    <span className="text-[10px] font-medium text-[var(--steel)]">{daySessions.length}</span>
                  )}
                </div>
                <div className="space-y-1">
                  {daySessions.slice(0, 3).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedId(s.id)}
                      className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-semibold leading-tight ${kindTone(
                        s.kind,
                      )} ${selectedId === s.id ? "ring-2 ring-[var(--amber)]" : ""}`}
                      title={s.title}
                    >
                      {s.startTime ? `${s.startTime} · ` : ""}
                      {s.title}
                    </button>
                  ))}
                  {daySessions.length > 3 && (
                    <p className="px-1 text-[10px] text-[var(--steel)]">+{daySessions.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="rounded-2xl border border-[var(--navy)]/10 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--steel)]">Session detail</p>
        {!selected ? (
          <p className="mt-3 text-sm text-[var(--steel)]">Select a session on the calendar to view details and bookings.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <div>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${kindTone(selected.kind)}`}>
                {selected.kind}
              </span>
              <h3 className="mt-2 font-display text-lg text-[var(--navy)]">{selected.title}</h3>
            </div>
            <dl className="space-y-2 text-sm text-[var(--navy)]">
              <div>
                <dt className="text-xs text-[var(--steel)]">Dates</dt>
                <dd>
                  {selected.startDate === selected.endDate
                    ? selected.startDate
                    : `${selected.startDate} → ${selected.endDate}`}
                  {selected.startTime && (
                    <span className="text-[var(--steel)]">
                      {" "}
                      · {selected.startTime}
                      {selected.endTime ? `–${selected.endTime}` : ""}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--steel)]">Location</dt>
                <dd>{selected.location}</dd>
              </div>
              {selected.instructorName && (
                <div>
                  <dt className="text-xs text-[var(--steel)]">Instructor</dt>
                  <dd>{selected.instructorName}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-[var(--steel)]">Capacity / bookings</dt>
                <dd>
                  {selected.confirmedCount} confirmed · {selected.bookingCount} total / {selected.capacity} seats
                </dd>
              </div>
            </dl>
            <Link
              href={`/admin/practicum?session=${selected.id}`}
              className="inline-flex rounded-lg bg-[var(--navy)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--navy-deep)]"
            >
              Manage bookings
            </Link>
          </div>
        )}

        <div className="mt-6 border-t border-[var(--navy)]/8 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--steel)]">Legend</p>
          <ul className="mt-2 space-y-1.5 text-xs text-[var(--navy)]">
            <li>
              <span className={`mr-2 inline-block rounded px-1.5 py-0.5 ${kindTone("practicum")}`}>practicum</span>
              MN BTW intensive
            </li>
            <li>
              <span className={`mr-2 inline-block rounded px-1.5 py-0.5 ${kindTone("campus")}`}>campus</span>
              Campus day / range
            </li>
            <li>
              <span className={`mr-2 inline-block rounded px-1.5 py-0.5 ${kindTone("class")}`}>class</span>
              Classroom block
            </li>
            <li>
              <span className={`mr-2 inline-block rounded px-1.5 py-0.5 ${kindTone("info")}`}>info</span>
              Info / orientation
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
