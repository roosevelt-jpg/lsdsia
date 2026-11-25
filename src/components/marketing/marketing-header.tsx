import Link from "next/link";
import { Search } from "lucide-react";
import { getSession } from "@/lib/auth";
import type { CmsNavItem, CmsSite } from "@prisma/client";

export async function MarketingHeader({
  site,
  nav,
}: {
  site: CmsSite;
  nav: CmsNavItem[];
}) {
  const session = await getSession();

  return (
    <header className="relative z-50 bg-[var(--navy-deep)] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--navy-deep)] shadow-[0_0_0_3px_rgba(230,168,23,0.25)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 2.5l2.4 7.2h7.6l-6.2 4.5 2.4 7.3L12 17l-6.2 4.5 2.4-7.3L2 9.7h7.6L12 2.5z" />
            </svg>
          </span>
          <span className="truncate font-[family-name:var(--font-marketing)] text-[11px] font-bold uppercase leading-tight tracking-[0.12em] sm:text-xs">
            {site.brandName}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="font-[family-name:var(--font-marketing)] text-sm font-medium text-white/85 transition hover:text-[var(--amber)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {site.searchEnabled && (
            <Link
              href="/resources"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white sm:flex"
              aria-label="Search resources"
            >
              <Search className="h-4 w-4" />
            </Link>
          )}
          {session ? (
            <Link
              href={session.role === "admin" ? "/admin" : "/app"}
              className="rounded-md border border-white/70 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {session.role === "admin" ? "Admin" : "Dashboard"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-white/70 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Login
            </Link>
          )}
          <Link
            href="/signup"
            className="rounded-md bg-[var(--amber)] px-3 py-1.5 text-sm font-bold text-[var(--navy-deep)] transition hover:bg-[var(--amber-hot)]"
          >
            Apply Now
          </Link>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 lg:hidden">
        {nav.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
