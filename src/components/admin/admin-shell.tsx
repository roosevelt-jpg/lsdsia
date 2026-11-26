"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  CreditCard,
  BarChart3,
  MessageSquare,
  Shield,
  Settings,
  LogOut,
  GraduationCap,
  ChevronDown,
  Bell,
  Menu,
  X,
  Search,
  IdCard,
  Building2,
  Globe,
  FileText,
} from "lucide-react";
import type { ConsoleView } from "@/lib/console-view";

export type AdminShellUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type AdminShellSite = {
  brandName: string;
  logoUrl?: string;
  dashboardTagline: string;
};

type NavChild = { href: string; label: string };
type NavItem =
  | { type: "link"; href: string; label: string; icon: typeof LayoutDashboard; badge?: number }
  | { type: "group"; label: string; icon: typeof LayoutDashboard; children: NavChild[] };

const adminNav: NavItem[] = [
  { type: "link", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    type: "group",
    label: "Students",
    icon: Users,
    children: [
      { href: "/admin/candidates", label: "All Students" },
      { href: "/admin/applications", label: "Applications" },
      { href: "/admin/licenses", label: "ID / Licenses" },
      { href: "/admin/levels", label: "Enrollments" },
      { href: "/admin/quizzes", label: "Progress & Results" },
    ],
  },
  {
    type: "group",
    label: "Courses & Lessons",
    icon: BookOpen,
    children: [
      { href: "/admin/content", label: "Courses" },
      { href: "/admin/content", label: "Lessons" },
      { href: "/admin/materials", label: "Videos & Materials" },
      { href: "/admin/quizzes", label: "Assessments" },
      { href: "/admin/quiz-slides", label: "Q&A Answer Slides" },
      { href: "/admin/candidates", label: "Certificates" },
    ],
  },
  {
    type: "group",
    label: "Scheduling",
    icon: CalendarDays,
    children: [
      { href: "/admin/schedule", label: "Class Schedule" },
      { href: "/admin/practicum", label: "Practical Training" },
      { href: "/admin/schedule", label: "Instructor Calendar" },
    ],
  },
  {
    type: "group",
    label: "Payments & Billing",
    icon: CreditCard,
    children: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/pricing", label: "Pricing" },
    ],
  },
  { type: "link", href: "/admin#reports", label: "Reports & Analytics", icon: BarChart3 },
  { type: "link", href: "/admin/website", label: "Communication", icon: MessageSquare, badge: 3 },
  { type: "link", href: "/admin/settings", label: "Users & Roles", icon: Shield },
  { type: "link", href: "/admin/settings", label: "Settings", icon: Settings },
];

const instructorNav: NavItem[] = [
  { type: "link", href: "/admin/teach", label: "Teaching home", icon: LayoutDashboard },
  {
    type: "group",
    label: "Courses",
    icon: BookOpen,
    children: [
      { href: "/admin/content", label: "Courses & lessons" },
      { href: "/admin/materials", label: "Videos & materials" },
      { href: "/admin/quizzes", label: "Assessments" },
    ],
  },
  {
    type: "group",
    label: "Schedule",
    icon: CalendarDays,
    children: [
      { href: "/admin/schedule", label: "Calendar" },
      { href: "/admin/practicum", label: "Booking requests" },
    ],
  },
  {
    type: "group",
    label: "Students",
    icon: Users,
    children: [
      { href: "/admin/candidates", label: "Assigned students" },
      { href: "/admin/applications", label: "Applications" },
      { href: "/admin/licenses", label: "ID / license review" },
    ],
  },
];

const adminExtraLinks = [
  { href: "/admin/school-launch", label: "School launch", icon: Building2 },
  { href: "/admin/website", label: "Website CMS", icon: Globe },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/licenses", label: "Licenses", icon: IdCard },
];

function pathActive(pathname: string, href: string) {
  if (href.includes("#")) return pathname === href.split("#")[0];
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/teach") return pathname === "/admin/teach";
  return pathname.startsWith(href);
}

export function AdminShell({
  user,
  site,
  viewMode,
  logoutAction,
  children,
}: {
  user: AdminShellUser;
  site: AdminShellSite;
  viewMode: ConsoleView;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = viewMode === "instructor" ? instructorNav : adminNav;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    const match = nav.find(
      (n) => n.type === "group" && n.children.some((c) => pathActive(pathname, c.href)),
    );
    return match && match.type === "group" ? match.label : nav[1]?.type === "group" ? nav[1].label : null;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const homeHref = viewMode === "instructor" ? "/admin/teach" : "/admin";
  const roleLabel = viewMode === "instructor" ? "Instructor" : "Administrator";

  const Sidebar = (
    <aside className="flex h-full w-[272px] flex-col bg-[var(--navy-deep)] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href={homeHref} className="block" onClick={() => setMobileOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.logoUrl || "/cms/logo-full-light.png"}
            alt={site.brandName}
            className="h-10 w-auto max-w-[200px] object-contain object-left"
          />
          <span className="mt-2 block text-[11px] leading-snug text-white/55">{site.dashboardTagline}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          if (item.type === "link") {
            const Icon = item.icon;
            const active = pathActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-[#2b6cb0] text-white" : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="rounded-full bg-[var(--amber)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--navy-deep)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          }

          const Icon = item.icon;
          const expanded = openGroup === item.label;
          const childActive = item.children.some((c) => pathActive(pathname, c.href));
          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => setOpenGroup(expanded ? null : item.label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  childActive ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                  {item.children.map((c) => (
                    <Link
                      key={`${item.label}-${c.label}`}
                      href={c.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-md px-2 py-1.5 text-[13px] ${
                        pathActive(pathname, c.href)
                          ? "bg-[#2b6cb0]/40 font-semibold text-white"
                          : "text-white/60 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {viewMode === "admin" && (
          <div className="pt-3">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Academy tools</p>
            {adminExtraLinks.map((l) => {
              const Icon = l.icon;
              const active = pathActive(pathname, l.href);
              return (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Switch Role</p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/admin/view?mode=instructor"
            className={`rounded-lg px-2 py-2 text-center text-[11px] font-semibold ${
              viewMode === "instructor"
                ? "bg-[var(--amber)] font-bold text-[var(--navy-deep)]"
                : "border border-white/15 text-white/75 hover:bg-white/8"
            }`}
          >
            Instructor View
          </Link>
          <Link
            href="/admin/view?mode=admin"
            className={`rounded-lg px-2 py-2 text-center text-[11px] font-semibold ${
              viewMode === "admin"
                ? "bg-[var(--amber)] font-bold text-[var(--navy-deep)]"
                : "border border-white/15 text-white/75 hover:bg-white/8"
            }`}
          >
            Administrator View
          </Link>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-white/50 hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <div className="admin-shell min-h-screen bg-[#eef2f7] font-[family-name:var(--font-marketing)] md:flex">
      <div className="hidden md:block">{Sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 z-10">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--navy)]/8 bg-white">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <button
              type="button"
              className="rounded-lg p-2 text-[var(--navy)] hover:bg-[var(--mist)] md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <form action="/admin/candidates" className="relative mx-auto hidden w-full max-w-2xl flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--steel)]" />
              <input
                name="q"
                placeholder={
                  viewMode === "instructor"
                    ? "Search students, sessions, courses..."
                    : "Search students, courses, applications..."
                }
                className="h-10 w-full rounded-full border border-[var(--navy)]/10 bg-[#f4f7fb] py-2 pl-10 pr-3 text-sm text-[var(--navy)] outline-none placeholder:text-[var(--steel)] focus:ring-2 focus:ring-[#2b6cb0]/30"
              />
            </form>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link
                href="/admin/licenses"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--navy)]/10 bg-white text-[var(--navy)] shadow-sm"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  5
                </span>
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-[var(--navy)]/10 bg-white py-1.5 pl-1.5 pr-3 shadow-sm"
                  aria-expanded={menuOpen}
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--amber)]/40"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/cms/admin/admin-avatar.jpg"
                      alt=""
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--amber)]/40"
                    />
                  )}
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-semibold text-[var(--navy)]">{user.name}</span>
                    <span className="block text-[11px] text-[var(--steel)]">{roleLabel}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-[var(--steel)]" />
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-white py-1 shadow-lg">
                    <div className="border-b border-[var(--navy)]/8 px-3 py-2">
                      <p className="text-sm font-medium text-[var(--navy)]">{user.name}</p>
                      <p className="truncate text-xs text-[var(--steel)]">{user.email}</p>
                    </div>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--navy)] hover:bg-[var(--mist)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-[var(--steel)]" /> Profile & settings
                    </Link>
                    <Link
                      href={viewMode === "instructor" ? "/admin/view?mode=admin" : "/admin/view?mode=instructor"}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--navy)] hover:bg-[var(--mist)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      <GraduationCap className="h-4 w-4 text-[var(--steel)]" />
                      {viewMode === "instructor" ? "Administrator view" : "Instructor view"}
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                      onClick={() => startTransition(() => logoutAction())}
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
