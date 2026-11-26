import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ScheduleCalendar } from "@/components/admin/schedule-calendar";
import { Button } from "@/components/ui/button";

const CAMPUS_DEFAULT = "7240 Brooklyn Blvd, Minneapolis, MN";

async function createSession(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const title = String(formData.get("title") || "").trim();
  const practicalSkuId = String(formData.get("practicalSkuId") || "").trim();
  const startDate = String(formData.get("startDate") || "").trim();
  const endDate = String(formData.get("endDate") || startDate).trim() || startDate;
  const startTime = String(formData.get("startTime") || "").trim() || null;
  const endTime = String(formData.get("endTime") || "").trim() || null;
  const kind = String(formData.get("kind") || "practicum").trim() || "practicum";
  const location = String(formData.get("location") || "").trim() || CAMPUS_DEFAULT;
  const instructorName = String(formData.get("instructorName") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const capacity = Math.max(1, Number(formData.get("capacity") || 8) || 8);

  if (!title || !practicalSkuId || !startDate) {
    redirect("/admin/schedule?error=" + encodeURIComponent("Title, SKU, and start date are required."));
  }
  if (endDate < startDate) {
    redirect("/admin/schedule?error=" + encodeURIComponent("End date must be on or after start date."));
  }

  const sku = await prisma.practicalSku.findUnique({ where: { id: practicalSkuId } });
  if (!sku) redirect("/admin/schedule?error=" + encodeURIComponent("Unknown practical SKU."));

  const created = await prisma.practicumSession.create({
    data: {
      title,
      practicalSkuId,
      startDate,
      endDate,
      startTime,
      endTime,
      kind,
      location,
      instructorName,
      notes,
      capacity,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "admin.schedule_create",
      metaJson: JSON.stringify({ sessionId: created.id, title }),
    },
  });

  redirect(`/admin/schedule?created=${created.id}`);
}

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  await requireUser(["admin"]);
  const params = await searchParams;

  const [sessions, skus] = await Promise.all([
    prisma.practicumSession.findMany({
      orderBy: { startDate: "asc" },
      include: {
        bookings: { select: { status: true } },
        practicalSku: { select: { name: true, code: true } },
      },
    }),
    prisma.practicalSku.findMany({ orderBy: { name: "asc" } }),
  ]);

  const calendarSessions = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    startDate: s.startDate,
    endDate: s.endDate,
    startTime: s.startTime,
    endTime: s.endTime,
    kind: s.kind,
    location: s.location,
    instructorName: s.instructorName,
    capacity: s.capacity,
    bookingCount: s.bookings.length,
    confirmedCount: s.bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--amber)]">Minnesota campus</p>
          <h1 className="font-display text-3xl text-[var(--navy)]">Class & practicum schedule</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--steel)]">
            Create and view campus sessions at {CAMPUS_DEFAULT}. Candidates book against these sessions from{" "}
            <Link href="/app/practicum" className="font-semibold text-[#2b6cb0] underline">
              Live Sessions / practicum
            </Link>
            . Phone: +1 763-390-7637.
          </p>
        </div>
        <Link
          href="/admin/practicum"
          className="rounded-lg border border-[var(--navy)]/15 bg-white px-4 py-2 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--mist)]"
        >
          Booking queue
        </Link>
      </div>

      {params.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{params.error}</p>
      )}
      {params.created && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Session created. It appears on the calendar and is available for candidate booking requests.
        </p>
      )}

      <ScheduleCalendar sessions={calendarSessions} />

      <section className="rounded-2xl border border-[var(--navy)]/10 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl text-[var(--navy)]">Create session</h2>
        <p className="mt-1 text-sm text-[var(--steel)]">
          Multi-day BTW intensives use start/end dates. Single campus days can set the same date plus start/end times.
        </p>
        {skus.length === 0 ? (
          <p className="mt-4 text-sm text-amber-800">
            No practical SKUs seeded yet — run seed / set pricing before creating sessions.
          </p>
        ) : (
          <form action={createSession} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm sm:col-span-2 lg:col-span-2">
              <span className="mb-1 block font-semibold text-[var(--navy)]">Title</span>
              <input
                name="title"
                required
                placeholder="Spring Minnesota BTW intensive"
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[var(--navy)]">Kind</span>
              <select
                name="kind"
                defaultValue="practicum"
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              >
                <option value="practicum">Practicum (BTW intensive)</option>
                <option value="campus">Campus / range day</option>
                <option value="class">Classroom block</option>
                <option value="info">Info / orientation</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[var(--navy)]">Practical SKU</span>
              <select
                name="practicalSkuId"
                required
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              >
                {skus.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[var(--navy)]">Start date</span>
              <input
                type="date"
                name="startDate"
                required
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[var(--navy)]">End date</span>
              <input
                type="date"
                name="endDate"
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[var(--navy)]">Start time</span>
              <input
                type="time"
                name="startTime"
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[var(--navy)]">End time</span>
              <input
                type="time"
                name="endTime"
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[var(--navy)]">Capacity</span>
              <input
                type="number"
                name="capacity"
                min={1}
                defaultValue={8}
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-[var(--navy)]">Location</span>
              <input
                name="location"
                defaultValue={CAMPUS_DEFAULT}
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-[var(--navy)]">Instructor</span>
              <input
                name="instructorName"
                placeholder="John Addo"
                defaultValue="John Addo"
                className="h-10 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </label>
            <label className="block text-sm sm:col-span-2 lg:col-span-3">
              <span className="mb-1 block font-semibold text-[var(--navy)]">Notes</span>
              <textarea
                name="notes"
                rows={2}
                placeholder="Arrive Sunday evening; behind-the-wheel Mon–Fri."
                className="w-full rounded-lg border border-[var(--navy)]/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </label>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit">Add to calendar</Button>
            </div>
          </form>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg text-[var(--navy)]">All upcoming sessions</h2>
        <ul className="mt-3 divide-y divide-[var(--navy)]/8 overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-white">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-[var(--navy)]">
                  <span className="mr-2 rounded bg-[var(--mist)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--steel)]">
                    {s.kind}
                  </span>
                  {s.title}
                </p>
                <p className="text-[var(--steel)]">
                  {s.startDate}
                  {s.endDate !== s.startDate ? ` → ${s.endDate}` : ""}
                  {s.startTime ? ` · ${s.startTime}` : ""}
                  {s.endTime ? `–${s.endTime}` : ""} · {s.location}
                </p>
              </div>
              <p className="text-[var(--steel)]">
                {s.bookings.length}/{s.capacity} booked · {s.practicalSku.code}
              </p>
            </li>
          ))}
          {sessions.length === 0 && (
            <li className="px-4 py-6 text-sm text-[var(--steel)]">No sessions yet — create one above.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
