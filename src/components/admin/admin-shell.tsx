"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  LayoutDashboard,
  Layers,
  BadgeDollarSign,
  Users,
  ShoppingCart,
  BookOpen,
  ClipboardList,
  CalendarDays,
  Settings,
  LogOut,
  GraduationCap,
  ChevronDown,
  Bell,
} from "lucide-react";

export type AdminShellUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/levels", label: "Levels", icon: Layers },
  { href: "/admin/pricing", label: "Pricing", icon: BadgeDollarSign },
  { href: "/admin/candidates", label: "Candidates", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/content", label: "Content", icon: BookOpen },
  { href: "/admin/quizzes", label: "Quizzes", icon: ClipboardList },
  { href: "/admin/practicum", label: "Practicum", icon: CalendarDays },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminShell({
  user,
  logoutAction,
  children,
}: {
  user: AdminShellUser;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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

  const pageTitle =
    links.find((l) => (l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href)))?.label ??
    "Admin";

  return (
    <div className="admin-shell min-h-screen md:flex">
      <aside className="relative z-20 border-b border-white/10 bg-[var(--navy-deep)] text-white md:flex md:min-h-screen md:w-64 md:flex-col md:border-b-0 md:border-r md:border-white/10">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/admin" className="block">
            <p className="font-display text-lg tracking-tight">Life Star</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[var(--amber)]">Admin Console</p>
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 py-3 md:flex-1 md:flex-col md:overflow-visible md:px-3">
          {links.map((l) => {
            const Icon = l.icon;
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(230,168,23,0.35)]"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[var(--amber)]" : "text-white/45"}`} />
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/app"
            className="mt-1 flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm text-[var(--amber)] hover:bg-white/8 md:mt-auto"
          >
            <GraduationCap className="h-4 w-4 shrink-0" />
            Candidate view
          </Link>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--navy)]/10 bg-[rgba(247,250,252,0.86)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-5 py-3.5 md:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--steel)]">Life Star Academy</p>
              <h1 className="font-display text-xl text-[var(--navy)] md:text-2xl">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--navy)]/10 bg-white text-[var(--steel)] shadow-sm sm:flex"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-[var(--navy)]/10 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-[var(--navy)]/20"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--amber)]/40"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--navy)] text-xs font-semibold text-white">
                      {initials(user.name) || "A"}
                    </span>
                  )}
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-medium text-[var(--navy)]">{user.name}</span>
                    <span className="block text-[11px] text-[var(--steel)]">{user.email}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-[var(--steel)]" />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-white py-1 shadow-lg"
                  >
                    <div className="border-b border-[var(--navy)]/8 px-3 py-2">
                      <p className="text-sm font-medium text-[var(--navy)]">{user.name}</p>
                      <p className="truncate text-xs text-[var(--steel)]">{user.email}</p>
                    </div>
                    <Link
                      href="/admin/settings"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--navy)] hover:bg-[var(--mist)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-[var(--steel)]" />
                      Profile & settings
                    </Link>
                    <Link
                      href="/app"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--navy)] hover:bg-[var(--mist)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      <GraduationCap className="h-4 w-4 text-[var(--steel)]" />
                      Candidate view
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={pending}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                      onClick={() => startTransition(() => logoutAction())}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
