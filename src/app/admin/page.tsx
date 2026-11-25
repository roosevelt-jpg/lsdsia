import Link from "next/link";
import {
  Users,
  ShoppingCart,
  ClipboardList,
  CalendarDays,
  BadgeDollarSign,
  TrendingUp,
  BookOpen,
  Layers,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export default async function AdminHome() {
  const [
    candidates,
    coaches,
    admins,
    orders,
    paidOrders,
    pendingOrders,
    revenueAgg,
    questions,
    quizAttempts,
    passedAttempts,
    bookings,
    bookingGroups,
    levels,
    lessons,
    recentOrders,
    recentCandidates,
    licensesPending,
    schoolPlansActive,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "candidate" } }),
    prisma.user.count({ where: { role: "coach" } }),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.aggregate({ where: { status: "paid" }, _sum: { totalCents: true } }),
    prisma.question.count(),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.count({ where: { passed: true } }),
    prisma.practicumBooking.count(),
    prisma.practicumBooking.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.enrollmentLevel.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.lesson.count(),
    prisma.order.findMany({
      include: { user: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      where: { role: "candidate" },
      include: { enrollments: { include: { level: true } }, licenseVerification: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.licenseVerification.count({ where: { status: "pending" } }),
    prisma.schoolLaunchPlan.count({
      where: { status: { in: ["in_progress", "docs_submitted", "coaching"] } },
    }),
  ]);

  const revenueCents = revenueAgg._sum.totalCents ?? 0;
  const bookingByStatus = Object.fromEntries(bookingGroups.map((g) => [g.status, g._count._all]));
  const requested = bookingByStatus.requested ?? 0;
  const confirmed = bookingByStatus.confirmed ?? 0;
  const completed = bookingByStatus.completed ?? 0;

  const stats = [
    {
      label: "Candidates",
      value: String(candidates),
      icon: Users,
      href: "/admin/candidates",
      detail: `${coaches} coaches · ${admins} admins`,
      bar: pct(candidates, candidates + coaches + admins || 1),
      tone: "from-[#0b1f33] to-[#1a3a55]",
    },
    {
      label: "Orders",
      value: String(orders),
      icon: ShoppingCart,
      href: "/admin/orders",
      detail: `${paidOrders} paid · ${pendingOrders} pending`,
      bar: pct(paidOrders, orders || 1),
      tone: "from-[#16324a] to-[#2a4d68]",
    },
    {
      label: "Paid revenue",
      value: formatUsd(revenueCents),
      icon: BadgeDollarSign,
      href: "/admin/orders",
      detail: `${pct(paidOrders, orders || 1)}% of orders collected`,
      bar: pct(paidOrders, orders || 1),
      tone: "from-[#8a6a12] to-[#c4921a]",
    },
    {
      label: "Quiz bank",
      value: String(questions),
      icon: ClipboardList,
      href: "/admin/quizzes",
      detail: `${quizAttempts} attempts · ${passedAttempts} passed`,
      bar: pct(passedAttempts, quizAttempts || 1),
      tone: "from-[#0f2a3f] to-[#24506e]",
    },
    {
      label: "Practicum",
      value: String(bookings),
      icon: CalendarDays,
      href: "/admin/practicum",
      detail: `${requested} requested · ${confirmed} confirmed`,
      bar: pct(confirmed + completed, bookings || 1),
      tone: "from-[#1c3348] to-[#3a5a74]",
    },
    {
      label: "Curriculum",
      value: String(lessons),
      icon: BookOpen,
      href: "/admin/content",
      detail: `${levels.length} enrollment levels`,
      bar: 100,
      tone: "from-[#12283a] to-[#2c4f6a]",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-2xl border border-[var(--navy)]/10 bg-gradient-to-br from-[var(--navy-deep)] via-[var(--navy)] to-[#1c3d57] p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--amber)]">Operations overview</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Life Star Academy</h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Monitor enrollments, tuition collections, quiz readiness, and Minnesota practicum demand from one console.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/candidates">Review candidates</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/orders">View orders</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/licenses">Licenses ({licensesPending})</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/school-launch">School launch ({schoolPlansActive})</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="group">
              <Card className="h-full overflow-hidden p-0 transition group-hover:border-[var(--amber)]/40 group-hover:shadow-md">
                <div className={`bg-gradient-to-br ${s.tone} px-5 py-4 text-white`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-white/65">{s.label}</p>
                      <p className="mt-2 font-display text-3xl">{s.value}</p>
                    </div>
                    <span className="rounded-lg bg-white/10 p-2">
                      <Icon className="h-5 w-5 text-[var(--amber)]" />
                    </span>
                  </div>
                </div>
                <div className="space-y-2 px-5 py-4">
                  <p className="text-sm text-[var(--steel)]">{s.detail}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--mist)]">
                    <div
                      className="progress-bar h-full rounded-full bg-[var(--amber)]"
                      style={{ width: `${Math.max(s.bar, 4)}%` }}
                    >
                      <span className="block h-full w-full" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-display text-lg text-[var(--navy)]">
                <Layers className="h-4 w-4 text-[var(--amber)]" />
                Enrollment by level
              </p>
              <p className="text-xs text-[var(--steel)]">Active candidate distribution</p>
            </div>
            <Link href="/admin/levels" className="text-xs font-medium text-[var(--navy)] underline">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {levels.length === 0 && <p className="text-sm text-[var(--steel)]">No levels seeded yet.</p>}
            {levels.map((level) => {
              const count = level._count.enrollments;
              const max = Math.max(...levels.map((l) => l._count.enrollments), 1);
              return (
                <div key={level.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-[var(--navy)]">{level.name}</span>
                    <span className="text-[var(--steel)]">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--mist)]">
                    <div
                      className="h-full rounded-full bg-[var(--navy)]"
                      style={{ width: `${Math.max((count / max) * 100, count ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-display text-lg text-[var(--navy)]">
                <TrendingUp className="h-4 w-4 text-[var(--amber)]" />
                Practicum pipeline
              </p>
              <p className="text-xs text-[var(--steel)]">Campus booking status breakdown</p>
            </div>
            <Link href="/admin/practicum" className="text-xs font-medium text-[var(--navy)] underline">
              Open
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Requested", value: requested },
              { label: "Confirmed", value: confirmed },
              { label: "Completed", value: completed },
              { label: "Eligible", value: bookingByStatus.eligible ?? 0 },
              { label: "Payment due", value: bookingByStatus.payment_required ?? 0 },
              { label: "Total", value: bookings },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-[var(--mist)] px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--steel)]">{item.label}</p>
                <p className="mt-1 font-display text-2xl text-[var(--navy)]">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-lg text-[var(--navy)]">Recent orders</p>
            <Link href="/admin/orders" className="text-xs font-medium underline">
              All orders
            </Link>
          </div>
          <div className="divide-y divide-[var(--navy)]/8">
            {recentOrders.length === 0 && <p className="text-sm text-[var(--steel)]">No orders yet.</p>}
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--navy)]">{o.user.name}</p>
                  <p className="text-xs text-[var(--steel)]">
                    {o.items[0]?.label ?? "Order"} · {o.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--navy)]">{formatUsd(o.totalCents)}</p>
                  <p className="text-xs capitalize text-[var(--steel)]">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-lg text-[var(--navy)]">Newest candidates</p>
            <Link href="/admin/candidates" className="text-xs font-medium underline">
              All candidates
            </Link>
          </div>
          <div className="divide-y divide-[var(--navy)]/8">
            {recentCandidates.length === 0 && <p className="text-sm text-[var(--steel)]">No candidates yet.</p>}
            {recentCandidates.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--navy)]">{c.name}</p>
                  <p className="text-xs text-[var(--steel)]">{c.email}</p>
                </div>
                <div className="text-right text-xs text-[var(--steel)]">
                  <p>{c.enrollments[0]?.level.name ?? "No level"}</p>
                  <p className="capitalize">
                    DL: {(c.licenseVerification?.status ?? "not submitted").replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
