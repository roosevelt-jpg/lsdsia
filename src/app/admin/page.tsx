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
  Bell,
  Clock,
  CheckCircle2,
  CalendarDays,
  FileText,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { loadCmsSite, resolveCmsImage } from "@/lib/cms";
import { parseAdminDashboardCopy } from "@/lib/admin-dashboard-cms";
import {
  EnrollmentTrendChart,
  StudentProgressDonut,
  CourseEnrollmentBars,
} from "@/components/admin/admin-dashboard-charts";
import { RecentApplicationsTable } from "@/components/admin/recent-applications-table";

export const dynamic = "force-dynamic";

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
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
  const heroBg =
    resolveCmsImage(site.adminHeroBgUrl, mediaMap) ||
    site.adminHeroBgUrl ||
    "/cms/admin/hero-banner.jpg";
  const promoImg = resolveCmsImage(site.adminPromoImageUrl, mediaMap) || site.adminPromoImageUrl;
  const dash = parseAdminDashboardCopy(
    (site as { adminDashboardJson?: string }).adminDashboardJson,
  );

  const revenueCents = revenueAgg._sum.totalCents ?? 0;
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
          name: l.name.length > 28 ? `${l.name.slice(0, 26)}…` : l.name,
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

  const notifications = dash.notifications.items.map((n, i) => {
    if (i === 1 && paidOrders > 0) {
      return {
        ...n,
        detail: n.detail.includes("$")
          ? n.detail
          : `${paidOrders} paid order${paidOrders === 1 ? "" : "s"} on record`,
      };
    }
    return n;
  });

  const metrics = [
    {
      label: dash.metrics.studentsLabel,
      value: candidates.toLocaleString(),
      hint: dash.metrics.studentsHint,
      hintTone: "text-emerald-600",
      icon: Users,
      iconTone: "bg-sky-50 text-sky-700",
      href: "/admin/candidates",
    },
    {
      label: dash.metrics.coursesLabel,
      value: String(Math.max(modules, lessons > 0 ? Math.ceil(lessons / 4) : 0)),
      hint: dash.metrics.coursesHint,
      hintTone: "text-emerald-600",
      icon: BookOpen,
      iconTone: "bg-indigo-50 text-indigo-700",
      href: "/admin/content",
    },
    {
      label: dash.metrics.instructorsLabel,
      value: String(Math.max(coaches, 1)),
      hint: dash.metrics.instructorsHint,
      hintTone: "text-emerald-600",
      icon: UserCheck,
      iconTone: "bg-amber-50 text-amber-700",
      href: "/admin/settings",
    },
    {
      label: dash.metrics.pendingLabel,
      value: String(licensesPending),
      hint: licensesPending > 0 ? dash.metrics.pendingHint : "All clear",
      hintTone: licensesPending > 0 ? "text-amber-600" : "text-emerald-600",
      icon: FileWarning,
      iconTone: "bg-amber-50 text-amber-700",
      href: "/admin/licenses",
      pending: licensesPending > 0,
    },
    {
      label: dash.metrics.revenueLabel,
      value: formatUsd(revenueCents),
      hint: dash.metrics.revenueHint,
      hintTone: "text-emerald-600",
      icon: BadgeDollarSign,
      iconTone: "bg-emerald-50 text-emerald-700",
      href: "/admin/orders",
    },
  ];

  const quickActionIcons = [UserPlus, Layers, CalendarPlus, Wallet, FileSpreadsheet, Megaphone];
  const quickActions = dash.quickActions.items.map((item, i) => ({
    ...item,
    icon: quickActionIcons[i % quickActionIcons.length]!,
  }));

  const applicationRows = applications.map((a) => ({
    id: a.id,
    name: a.name,
    program: a.program,
    dateLabel: a.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: a.status,
    href: a.href,
    action: a.action,
  }));

  const demoApplications =
    applicationRows.length > 0
      ? applicationRows
      : [
          {
            id: "demo-1",
            name: "John Miller",
            program: "Instructor Training Program",
            dateLabel: "Jan 24, 2025",
            status: "Pending Review",
            href: "/admin/licenses",
            action: "Review",
          },
          {
            id: "demo-2",
            name: "Sarah Williams",
            program: "State Licensing Prep",
            dateLabel: "Jan 23, 2025",
            status: "Approved",
            href: "/admin/licenses",
            action: "View",
          },
          {
            id: "demo-3",
            name: "Emily Carter",
            program: "Business Setup Course",
            dateLabel: "Jan 22, 2025",
            status: "Documents Required",
            href: "/admin/licenses",
            action: "Request",
          },
          {
            id: "demo-4",
            name: "Michael Brown",
            program: "Instructor Training Program",
            dateLabel: "Jan 21, 2025",
            status: "Pending Review",
            href: "/admin/licenses",
            action: "Review",
          },
          {
            id: "demo-5",
            name: "Anna Thompson",
            program: "Teaching Methods Workshop",
            dateLabel: "Jan 20, 2025",
            status: "Approved",
            href: "/admin/licenses",
            action: "View",
          },
        ];

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        {/* MAIN COLUMN — hero, metrics, charts, applications, quick actions */}
        <div className="space-y-6">
          {/* HERO — sharp text-free photo; CMS title/CTAs overlay in HTML */}
          <section className="relative overflow-hidden rounded-2xl text-white shadow-[0_16px_40px_rgba(11,31,51,0.16)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroBg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(105deg, rgba(8,28,72,0.94) 0%, rgba(12,48,110,0.78) 42%, rgba(12,48,110,0.28) 72%, rgba(12,48,110,0.12) 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute -left-6 -top-10 h-40 w-56 rotate-[-18deg] rounded-[40%] bg-gradient-to-br from-[#1a4fa0] via-[#0b2f66] to-transparent opacity-90"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-2 top-2 h-3 w-44 rotate-[-18deg] rounded-full bg-gradient-to-r from-[var(--amber)] to-transparent opacity-90"
              aria-hidden
            />
            <div className="relative px-6 py-8 lg:px-8 lg:py-10">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {site.adminHeroTitle || "Welcome to Life Star Instructors Academy"}
                </h2>
                <p className="mt-2 text-sm text-white/85 sm:text-base">
                  {site.adminHeroSubtitle ||
                    "Manage training, students, instructors and academy operations all in one place."}
                </p>
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
                  className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(43,108,176,0.10)] ring-1 ring-[#2b6cb0]/8 transition hover:ring-[#2b6cb0]/35"
                >
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${m.iconTone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-2xl font-bold text-[var(--navy)]">{m.value}</p>
                  <p className="text-xs text-[var(--steel)]">{m.label}</p>
                  <p className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${m.hintTone}`}>
                    {"pending" in m && m.pending ? <Clock className="h-3 w-3" /> : null}
                    {m.hint}
                  </p>
                </Link>
              );
            })}
          </section>

          <section id="reports" className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(43,108,176,0.08)] ring-1 ring-[#2b6cb0]/8 lg:col-span-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--navy)]">{dash.charts.trendTitle}</h3>
                  <p className="text-xs text-[var(--steel)]">{dash.charts.trendSubtitle}</p>
                </div>
                <span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-semibold text-[var(--navy)]">
                  {dash.charts.trendRangeLabel}
                </span>
              </div>
              <div className="mt-3">
                <EnrollmentTrendChart data={trend} />
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(43,108,176,0.08)] ring-1 ring-[#2b6cb0]/8 lg:col-span-1">
              <h3 className="text-sm font-bold text-[var(--navy)]">{dash.charts.progressTitle}</h3>
              <p className="text-xs text-[var(--steel)]">{dash.charts.progressSubtitle}</p>
              <div className="mt-3">
                <StudentProgressDonut
                  completed={progressCompletedPct}
                  inProgress={progressInPct}
                  notStarted={progressNotPct}
                />
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(43,108,176,0.08)] ring-1 ring-[#2b6cb0]/8 lg:col-span-1">
              <h3 className="text-sm font-bold text-[var(--navy)]">{dash.charts.coursesTitle}</h3>
              <p className="text-xs text-[var(--steel)]">{dash.charts.coursesSubtitle}</p>
              <div className="mt-3">
                <CourseEnrollmentBars data={courseBars} />
              </div>
            </div>
          </section>

          <RecentApplicationsTable
            rows={demoApplications}
            title={dash.applications.title}
            subtitle={dash.applications.subtitle}
            viewAllLabel={dash.applications.viewAllLabel}
            viewAllHref={dash.applications.viewAllHref}
            programFilterLabel={dash.applications.programFilterLabel}
            statusFilterLabel={dash.applications.statusFilterLabel}
          />

          <section className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(43,108,176,0.08)] ring-1 ring-[#2b6cb0]/8">
            <h3 className="mb-4 text-lg font-bold text-[var(--navy)]">{dash.quickActions.title}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex min-h-[72px] items-center gap-3 rounded-xl border border-[var(--navy)]/10 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-[var(--navy)] transition hover:border-[#2b6cb0]/40 hover:bg-white"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b6cb0]/10 text-[#2b6cb0]">
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
          <section className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(43,108,176,0.08)] ring-1 ring-[#2b6cb0]/8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--navy)]">
                <Bell className="h-4 w-4 text-[var(--amber)]" />
                {dash.notifications.title}
              </h3>
              <Link
                href={dash.notifications.viewAllHref}
                className="text-sm font-semibold text-[#2b6cb0] hover:underline"
              >
                {dash.notifications.viewAllLabel}
              </Link>
            </div>
            <ul className="divide-y divide-[var(--navy)]/8">
              {notifications.map((n) => {
                const Icon =
                  n.tone === "green" ? CheckCircle2 : n.tone === "blue" ? CalendarDays : FileText;
                const toneClass =
                  n.tone === "green"
                    ? "bg-emerald-50 text-emerald-600"
                    : n.tone === "blue"
                      ? "bg-sky-50 text-sky-600"
                      : "bg-amber-50 text-amber-600";
                return (
                  <li key={n.title} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--navy)]">{n.title}</p>
                      <p className="mt-0.5 truncate text-xs text-[var(--steel)]">{n.detail}</p>
                      <p className="mt-1 text-[10px] font-semibold text-[var(--steel)]">{n.time}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-[0_8px_24px_rgba(43,108,176,0.08)] ring-1 ring-[#2b6cb0]/8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--navy)]">{dash.sessions.title}</h3>
              <Link
                href={dash.sessions.viewAllHref}
                className="text-sm font-semibold text-[#2b6cb0] hover:underline"
              >
                {dash.sessions.viewAllLabel} →
              </Link>
            </div>
            <ul className="space-y-3">
              {bookingsUpcoming.length === 0 && (
                <>
                  {[
                    { day: "JAN", date: "28", title: "Instructor Training (Online)", time: "10:00 AM – 12:00 PM", count: 32 },
                    { day: "JAN", date: "29", title: "Practical Training – Group A", time: "9:00 AM – 1:00 PM", count: 12 },
                    { day: "JAN", date: "30", title: "Licensing Exam Prep", time: "2:00 PM – 4:00 PM", count: 28 },
                  ].map((s) => (
                    <li key={s.date + s.title} className="flex gap-3 rounded-lg border border-[var(--navy)]/8 p-3">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-[#2b6cb0]/10 text-[#2b6cb0]">
                        <span className="text-[9px] font-bold uppercase leading-none">{s.day}</span>
                        <span className="text-base font-bold leading-none">{s.date}</span>
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
              {bookingsUpcoming.map((s) => {
                const start = s.startDate ? new Date(s.startDate) : null;
                const day = start
                  ? start.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
                  : "TBD";
                const dateNum = start ? String(start.getDate()) : "–";
                return (
                  <li key={s.id} className="flex gap-3 rounded-lg border border-[var(--navy)]/8 p-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-[#2b6cb0]/10 text-[#2b6cb0]">
                      <span className="text-[9px] font-bold uppercase leading-none">{day}</span>
                      <span className="text-base font-bold leading-none">{dateNum}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--navy)]">{s.title}</p>
                      <p className="text-xs text-[var(--steel)]">
                        {s.endDate ? `Through ${s.endDate}` : "Scheduled"} · {s._count.bookings} students
                      </p>
                    </div>
                  </li>
                );
              })}
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
                {site.adminPromoCtaLabel} →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
