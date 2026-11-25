"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Route,
  Video,
  Clapperboard,
  ClipboardList,
  Award,
  FolderOpen,
  MessageSquare,
  LifeBuoy,
  Search,
  Bell,
  Menu,
  X,
  Check,
  ArrowRight,
  LogOut,
} from "lucide-react";

export type CandidateShellProps = {
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
  site: {
    brandName: string;
    logoUrl?: string;
    dashboardTagline: string;
    dashboardUpgradeImageUrl: string;
    dashboardUpgradeTitle: string;
    dashboardUpgradeBody: string;
    dashboardUpgradeCtaLabel: string;
    dashboardUpgradeCtaHref: string;
  };
  messageCount?: number;
  sessionDot?: boolean;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
};

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/learn", label: "My Courses", icon: BookOpen },
  { href: "/app/enroll", label: "Learning Path", icon: Route },
  { href: "/app/videos", label: "Videos", icon: Clapperboard },
  { href: "/app/practicum", label: "Live Sessions", icon: Video, dot: "session" as const },
  { href: "/app/quiz", label: "Assessments", icon: ClipboardList },
  { href: "/app/certificate", label: "Certificates", icon: Award },
  { href: "/app/resources", label: "Resources", icon: FolderOpen },
  { href: "/app/messages", label: "Messages", icon: MessageSquare, badge: "messages" as const },
  { href: "/app/support", label: "Support", icon: LifeBuoy },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function CandidateShell({
  user,
  site,
  messageCount = 0,
  sessionDot = false,
  logoutAction,
  children,
}: CandidateShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const upgradeLines = site.dashboardUpgradeBody.split("\n").filter(Boolean);

  const Sidebar = (
    <aside className="flex h-full w-72 flex-col bg-[var(--navy-deep)] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/app" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(site as { logoUrl?: string }).logoUrl || "/cms/logo-full-light.png"}
            alt={site.brandName}
            className="h-10 w-auto max-w-[200px] object-contain object-left"
          />
        </Link>
        <p className="mt-3 text-[11px] leading-snug text-white/55">{site.dashboardTagline}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-[#2b6cb0] text-white" : "text-white/75 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.dot === "session" && sessionDot && (
                <span className="h-2 w-2 rounded-full bg-red-500" />
              )}
              {item.badge === "messages" && messageCount > 0 && (
                <span className="rounded-full bg-[var(--amber)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--navy-deep)]">
                  {messageCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <div className="overflow-hidden rounded-xl bg-[#0a1628] ring-1 ring-white/10">
          <div className="relative h-24 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.dashboardUpgradeImageUrl} alt="" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] to-transparent" />
          </div>
          <div className="space-y-2 px-4 pb-4 pt-1">
            <p className="text-sm font-bold text-white">{site.dashboardUpgradeTitle}</p>
            <ul className="space-y-1">
              {upgradeLines.map((line) => (
                <li key={line} className="flex items-center gap-2 text-[11px] text-white/70">
                  <Check className="h-3 w-3 text-[var(--amber)]" />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href={site.dashboardUpgradeCtaHref}
              className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md bg-[var(--amber)] px-3 py-2 text-xs font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
            >
              {site.dashboardUpgradeCtaLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/55 hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#eef2f7] font-[family-name:var(--font-marketing)] md:flex">
      <div className="hidden md:block">{Sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 z-10">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--navy)]/8 bg-[var(--navy-deep)] text-white">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-white/10 md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <form action="/app/resources" className="relative mx-auto hidden w-full max-w-xl flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                name="q"
                placeholder="Search courses, lessons, resources..."
                className="h-10 w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-[var(--amber)]/50"
              />
            </form>

            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/app/messages"
                className="relative rounded-lg p-2 hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </Link>
              <div className="flex items-center gap-2.5">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-[var(--amber)]/40" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--amber)] text-xs font-bold text-[var(--navy-deep)]">
                    {initials(user.name) || "C"}
                  </span>
                )}
                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-[11px] capitalize text-white/55">
                    {user.role === "candidate" ? "Candidate" : user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
