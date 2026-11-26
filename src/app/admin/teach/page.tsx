import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BookOpen, CalendarDays, Users, Video } from "lucide-react";

export default async function InstructorTeachPage() {
  await requireUser(["admin"]);

  const [sessionCount, upcoming, bookingQueue, candidates, modules, lessons] = await Promise.all([
    prisma.practicumSession.count(),
    prisma.practicumSession.findMany({
      orderBy: { startDate: "asc" },
      take: 5,
      include: { bookings: true },
    }),
    prisma.practicumBooking.count({ where: { status: "requested" } }),
    prisma.user.count({ where: { role: "candidate" } }),
    prisma.module.count(),
    prisma.lesson.count(),
  ]);

  const courseCount = modules || lessons;

  const cards = [
    { href: "/admin/schedule", label: "Open schedule", icon: CalendarDays, detail: `${sessionCount} sessions on calendar` },
    { href: "/admin/content", label: "Courses & lessons", icon: BookOpen, detail: `${courseCount} content items` },
    { href: "/admin/candidates", label: "Assigned students", icon: Users, detail: `${candidates} candidates` },
    { href: "/admin/practicum", label: "Booking requests", icon: Video, detail: `${bookingQueue} awaiting confirm` },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--amber)]">Instructor view</p>
        <h1 className="font-display text-3xl text-[var(--navy)]">Teaching dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--steel)]">
          Focused tools for courses, Minnesota campus scheduling, and students. Switch back to Administrator View anytime
          from the sidebar. Campus: 7240 Brooklyn Blvd, Minneapolis · +1 763-390-7637.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href + c.label}
              href={c.href}
              className="rounded-2xl border border-[var(--navy)]/10 bg-white p-5 shadow-sm transition hover:border-[#2b6cb0]/40 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mist)] text-[var(--navy)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-[var(--navy)]">{c.label}</p>
                  <p className="mt-1 text-sm text-[var(--steel)]">{c.detail}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[var(--navy)]/10 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl text-[var(--navy)]">Upcoming campus sessions</h2>
          <Link href="/admin/schedule" className="text-sm font-semibold text-[#2b6cb0] hover:underline">
            Full calendar
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {upcoming.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--mist)]/60 px-3 py-2.5 text-sm">
              <div>
                <p className="font-semibold text-[var(--navy)]">{s.title}</p>
                <p className="text-[var(--steel)]">
                  {s.startDate}
                  {s.endDate !== s.startDate ? ` → ${s.endDate}` : ""}
                  {s.startTime ? ` · ${s.startTime}` : ""} · {s.location}
                </p>
              </div>
              <span className="text-[var(--steel)]">
                {s.bookings.length}/{s.capacity} booked
              </span>
            </li>
          ))}
          {upcoming.length === 0 && (
            <li className="text-sm text-[var(--steel)]">
              No sessions yet.{" "}
              <Link href="/admin/schedule" className="font-semibold text-[#2b6cb0] underline">
                Create one on the schedule
              </Link>
              .
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
