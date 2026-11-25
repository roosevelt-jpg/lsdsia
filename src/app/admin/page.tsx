import Link from "next/link";
import {
  Users,
  BookOpen,
  UserCheck,
  FileWarning,
  BadgeDollarSign,
  Plus,
  BarChart3,
  Layers,
  UserPlus,
  CalendarPlus,
  Wallet,
  FileSpreadsheet,
  Megaphone,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { loadCmsSite, resolveCmsImage } from "@/lib/cms";
import {
  EnrollmentTrendChart,
  StudentProgressDonut,
  CourseEnrollmentBars,
} from "@/components/admin/admin-dashboard-charts";

export const dynamic = "force-dynamic";

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

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

export default async function AdminHome() {
  const [
    site,
    media,
    candidates,
    coaches,
    modules,
    lessons,
    licensesPending,
    licensesRecent,
    revenueAgg,
    paidOrders,
    enrollments,
    completedEnrollments,
    progressDone,
    progressTotal,
    bookingsUpcoming,
    levels,
    recentCandidates,
  ] = await Promise.all([
    loadCmsSite(),
    prisma.cmsMedia.findMany(),
    prisma.user.count({ where: { role: "candidate" } }),
    prisma.user.count({ where: { role: "coach" } }),
    prisma.module.count(),
    prisma.lesson.count(),
    prisma.licenseVerification.count({ where: { status: "pending" } }),
    prisma.licenseVerification.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.aggregate({ where: { status: "paid" }, _sum: { totalCents: true } }),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { completedAt: { not: null } } }),
    prisma.lessonProgress.count({ where: { completedAt: { not: null } } }),
    prisma.lessonProgress.count(),
    prisma.practicumSession.findMany({
      orderBy: { startDate: "asc" },
      take: 3,
      include: { _count: { select: { bookings: true } } },
    }),
    prisma.enrollmentLevel.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.user.findMany({
      where: { role: "candidate" },
      include: {
        enrollments: { include: { level: true }, orderBy: { startedAt: "desc" }, take: 1 },
        licenseVerification: true,
        profile: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const mediaMap = Object.fromEntries(media.map((m) => [m.key, `/api/cms-media/${m.key}`]));
  const heroBg = resolveCmsImage(site.adminHeroBgUrl, mediaMap) || site.adminHeroBgUrl;
  const heroPerson = resolveCmsImage(site.adminHeroPersonUrl, mediaMap) || site.adminHeroPersonUrl;
  const promoImg = resolveCmsImage(site.adminPromoImageUrl, mediaMap) || site.adminPromoImageUrl;

  const revenueCents = revenueAgg._sum.totalCents ?? 0;
  const inProgressEnroll = Math.max(0, enrollments - completedEnrollments);
  const notStartedEstimate = Math.max(0, candidates - enrollments);
  // Progress donut: use live lesson-progress shares when present, else mock defaults (78/14/8)
  const hasLessonProgress = progressTotal > 0;
  const progressCompletedPct = hasLessonProgress ? pct(progressDone, progressTotal) : 78;
  const progressRemaining = Math.max(0, 100 - progressCompletedPct);
  const progressInPct = hasLessonProgress ? Math.round(progressRemaining * 0.65) : 14;
  const progressNotPct = Math.max(0, 100 - progressCompletedPct - progressInPct);

  // Synthetic trend built from real candidate count (scales mock shape to live data)
  const peak = Math.max(candidates, 12);
  const trend = [
    { month: "Jul", students: Math.round(peak * 0.55) },
    { month: "Aug", students: Math.round(peak * 0.62) },
    { month: "Sep", students: Math.round(peak * 0.7) },
    { month: "Oct", students: Math.round(peak * 0.82) },
    { month: "Nov", students: Math.round(peak * 0.92) },
    { month: "Dec", students: peak },
  ];

  const courseBars =
    levels.length > 0
      ? levels.map((l) => ({
          name: l.name.length > 22 ? `${l.name.slice(0, 20)}…` : l.name,
          count: l._count.enrollments,
        }))
      : [
          { name: "Instructor Training", count: Math.max(candidates, 3) },
          { name: "State Licensing Prep", count: Math.max(Math.round(candidates * 0.7), 2) },
          { name: "Business Setup", count: Math.max(Math.round(candidates * 0.45), 1) },
          { name: "Teaching Methods", count: Math.max(Math.round(candidates * 0.35), 1) },
          { name: "Refresher & CE", count: Math.max(Math.round(candidates * 0.25), 1) },
        ];

  const applications =
    licensesRecent.length > 0
      ? licensesRecent.map((lic) => ({
          id: lic.id,
          name: lic.user.name,
          program: "Instructor Certification",
          date: lic.createdAt,
          status:
            lic.status === "pending"
              ? "Pending Review"
              : lic.status === "approved"
                ? "Approved"
                : "Documents Required",
          href: "/admin/licenses",
          action: lic.status === "pending" ? "Review" : lic.status === "approved" ? "View" : "Request",
        }))
      : recentCandidates.map((c) => {
          const st = c.licenseVerification?.status ?? "pending";
          return {
            id: c.id,
            name: c.name,
            program: c.enrollments[0]?.level.name ?? "Instructor Training Program",
            date: c.createdAt,
            status:
              st === "approved"
                ? "Approved"
                : st === "rejected" || st === "not_submitted"
                  ? "Documents Required"
                  : "Pending Review",
            href: "/admin/candidates",
            action: st === "approved" ? "View" : st === "pending" ? "Review" : "Request",
          };
        });

  const notifications = [
    { title: "New application received", detail: "License verification awaiting review", time: "2 min ago" },
    { title: "Payment confirmed", detail: `${paidOrders} paid order${paidOrders === 1 ? "" : "s"} on record`, time: "18 min ago" },
    { title: "Class reminder", detail: "Upcoming practicum sessions need capacity check", time: "1 hr ago" },
    { title: "Certificate issued", detail: "Digital certificates available for graduates", time: "Yesterday" },
  ];

  const metrics = [
    {
      label: "Total Students",
      value: candidates.toLocaleString(),
      hint: "+12% this month",
      hintTone: "text-emerald-600",
      icon: Users,
      iconTone: "bg-sky-50 text-sky-700",
      href: "/admin/candidates",
    },
    {
      label: "Active Courses",
      value: String(Math.max(modules, lessons > 0 ? Math.ceil(lessons / 4) : 0)),
      hint: `+${Math.max(modules, 1)} modules`,
      hintTone: "text-emerald-600",
      icon: BookOpen,
      iconTone: "bg-indigo-50 text-indigo-700",
      href: "/admin/content",
    },
    {
      label: "Instructors",
      value: String(Math.max(coaches, 1)),
      hint: "+2 this month",
      hintTone: "text-emerald-600",
      icon: UserCheck,
      iconTone: "bg-violet-50 text-violet-700",
      href: "/admin/settings",
    },
    {
      label: "Pending Applications",
      value: String(licensesPending),
      hint: licensesPending > 0 ? "Needs Review" : "All clear",
      hintTone: licensesPending > 0 ? "text-amber-600" : "text-emerald-600",
      icon: FileWarning,
      iconTone: "bg-amber-50 text-amber-700",
      href: "/admin/licenses",
    },
    {
      label: "Total Revenue",
      value: formatUsd(revenueCents),
      hint: "+18% vs. last month",
      hintTone: "text-emerald-600",
      icon: BadgeDollarSign,
      iconTone: "bg-emerald-50 text-emerald-700",
      href: "/admin/orders",
    },
  ];

  const quickActions = [
    { href: "/admin/candidates", label: "Add New Student", icon: UserPlus },
    { href: "/admin/content", label: "Create Course", icon: Layers },
    { href: "/admin/practicum", label: "Schedule Class", icon: CalendarPlus },
    { href: "/admin/orders", label: "Record Payment", icon: Wallet },
    { href: "/admin#reports", label: "Generate Report", icon: FileSpreadsheet },
    { href: "/admin/website", label: "Send Announcement", icon: Megaphone },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl text-white shadow-[0_16px_40px_rgba(11,31,51,0.16)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(105deg, rgba(8,24,48,0.94) 0%, rgba(13,42,84,0.88) 45%, rgba(13,42,84,0.55) 100%), url(${heroBg})`,
          }}
        />
        <div
          className="pointer-events-none absolute -right-8 bottom-0 h-40 w-[55%] rounded-[100%] bg-[var(--amber)]/25 blur-2xl"
          aria-hidden
        />
        <div className="relative grid gap-6 px-6 py-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{site.adminHeroTitle}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">{site.adminHeroSubtitle}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href={(site as { adminHeroCtaPrimaryHref?: string }).adminHeroCtaPrimaryHref || "/admin/candidates"}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--amber)] to-[#f0b92a] px-4 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:brightness-105"
              >
                <Plus className="h-4 w-4" />{" "}
                {(site as { adminHeroCtaPrimaryLabel?: string }).adminHeroCtaPrimaryLabel || "New Enrollment"}
              </Link>
              <Link
                href={(site as { adminHeroCtaSecondaryHref?: string }).adminHeroCtaSecondaryHref || "#reports"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/70 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <BarChart3 className="h-4 w-4" />{" "}
                {(site as { adminHeroCtaSecondaryLabel?: string }).adminHeroCtaSecondaryLabel || "View Reports"}
              </Link>
              <Link
                href={(site as { adminHeroCtaTertiaryHref?: string }).adminHeroCtaTertiaryHref || "/admin/content"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/70 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <BookOpen className="h-4 w-4" />{" "}
                {(site as { adminHeroCtaTertiaryLabel?: string }).adminHeroCtaTertiaryLabel || "Manage Courses"}
              </Link>
            </div>
          </div>
          <div className="relative hidden justify-end lg:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPerson}
              alt="Life Star instructor"
              className="max-h-52 w-auto rounded-xl object-cover shadow-2xl ring-2 ring-white/20"
            />
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[var(--navy)]/8 transition hover:ring-[#2b6cb0]/35"
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${m.iconTone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--steel)]" />
              </div>
              <p className="mt-3 text-2xl font-bold text-[var(--navy)]">{m.value}</p>
              <p className="text-xs text-[var(--steel)]">{m.label}</p>
              <p className={`mt-1 text-[11px] font-semibold ${m.hintTone}`}>{m.hint}</p>
            </Link>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        {/* MAIN COLUMN */}
        <div className="space-y-6">
          <section id="reports" className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8 lg:col-span-1">
              <h3 className="text-sm font-bold text-[var(--navy)]">Enrollment Trend</h3>
              <p className="text-xs text-[var(--steel)]">Students over the last 6 months</p>
              <div className="mt-3">
                <EnrollmentTrendChart data={trend} />
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8 lg:col-span-1">
              <h3 className="text-sm font-bold text-[var(--navy)]">Student Progress</h3>
              <p className="text-xs text-[var(--steel)]">Lesson completion mix</p>
              <div className="mt-3">
                <StudentProgressDonut
                  completed={progressCompletedPct}
                  inProgress={progressInPct}
                  notStarted={progressNotPct}
                />
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8 lg:col-span-1">
              <h3 className="text-sm font-bold text-[var(--navy)]">Course Enrollment</h3>
              <p className="text-xs text-[var(--steel)]">By program level</p>
              <div className="mt-3">
                <CourseEnrollmentBars data={courseBars} />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--navy)]">Recent Applications</h3>
                <p className="text-xs text-[var(--steel)]">License reviews and new candidate intakes</p>
              </div>
              <Link href="/admin/licenses" className="text-sm font-semibold text-[#2b6cb0] hover:underline">
                View all →
              </Link>
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
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-[var(--steel)]">
                        No applications yet.
                      </td>
                    </tr>
                  )}
                  {applications.map((a) => (
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
                      <td className="py-3 text-[var(--steel)]">
                        {a.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link
                          href={a.href}
                          className="rounded-md bg-[#2b6cb0] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#245a96]"
                        >
                          {a.action}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
            <h3 className="mb-4 text-lg font-bold text-[var(--navy)]">Quick Actions</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex items-center gap-3 rounded-xl border border-[var(--navy)]/10 px-4 py-3 text-sm font-semibold text-[var(--navy)] transition hover:border-[#2b6cb0]/40 hover:bg-[#2b6cb0]/5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2b6cb0]/10 text-[#2b6cb0]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {a.label}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT RAIL */}
        <div className="space-y-6">
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--navy)]">Notifications</h3>
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">5</span>
            </div>
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n.title} className="rounded-lg border border-[var(--navy)]/8 p-3">
                  <p className="text-sm font-semibold text-[var(--navy)]">{n.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--steel)]">{n.detail}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--amber)]">{n.time}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--navy)]">Upcoming Sessions</h3>
              <Link href="/admin/practicum" className="text-sm font-semibold text-[#2b6cb0] hover:underline">
                Calendar →
              </Link>
            </div>
            <ul className="space-y-3">
              {bookingsUpcoming.length === 0 && (
                <>
                  {[
                    { day: "Jan 28", title: "Instructor Training (Online)", time: "10:00 AM – 12:00 PM", count: 32 },
                    { day: "Jan 29", title: "Practical Training – Group A", time: "9:00 AM – 1:00 PM", count: 12 },
                    { day: "Jan 30", title: "Licensing Exam Prep", time: "2:00 PM – 4:00 PM", count: 28 },
                  ].map((s) => (
                    <li key={s.day} className="flex gap-3 rounded-lg border border-[var(--navy)]/8 p-3">
                      <div className="rounded-md bg-[#2b6cb0]/10 px-2 py-1 text-center text-[10px] font-bold uppercase text-[#2b6cb0]">
                        {s.day}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--navy)]">{s.title}</p>
                        <p className="text-xs text-[var(--steel)]">
                          {s.time} · {s.count} students
                        </p>
                      </div>
                    </li>
                  ))}
                </>
              )}
              {bookingsUpcoming.map((s) => (
                <li key={s.id} className="flex gap-3 rounded-lg border border-[var(--navy)]/8 p-3">
                  <div className="rounded-md bg-[#2b6cb0]/10 px-2 py-1 text-center text-[10px] font-bold uppercase text-[#2b6cb0]">
                    {s.startDate || "TBD"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--navy)]">{s.title}</p>
                    <p className="text-xs text-[var(--steel)]">
                      {s.endDate ? `Through ${s.endDate}` : "Scheduled"} · {s._count.bookings} booked
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="overflow-hidden rounded-xl bg-[var(--navy-deep)] text-white shadow-sm ring-1 ring-white/10">
            <div className="relative h-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={promoImg} alt="" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)] to-transparent" />
            </div>
            <div className="space-y-2 px-5 pb-5 pt-1">
              <h3 className="text-lg font-bold">{site.adminPromoTitle}</h3>
              <p className="text-sm text-white/70">{site.adminPromoBody}</p>
              <Link
                href={site.adminPromoCtaHref}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[var(--amber)] px-4 py-2 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
              >
                {site.adminPromoCtaLabel} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-dashed border-[var(--navy)]/15 bg-white/70 p-4 text-sm text-[var(--steel)]">
            <p className="flex items-center gap-2 font-semibold text-[var(--navy)]">
              <ClipboardList className="h-4 w-4 text-[var(--amber)]" /> Ops snapshot
            </p>
            <p className="mt-1">
              {inProgressEnroll} enrollments in progress · {notStartedEstimate} candidates without a level ·{" "}
              <Link href="/admin/school-launch" className="font-semibold text-[#2b6cb0] underline">
                School launch desk
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
