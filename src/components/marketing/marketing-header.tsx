import Link from "next/link";
import { ChevronDown, Search, User } from "lucide-react";
import { getSession } from "@/lib/auth";
import { publicNavHref } from "@/lib/auth-paths";
import type { CmsNavItem, CmsSite } from "@prisma/client";
import { BrandLogo } from "@/components/brand-logo";

const DROPDOWN_HREFS = new Set(["/programs", "/admissions", "/students", "/resources", "/about"]);

export async function MarketingHeader({
  site,
  nav,
  overlay = false,
}: {
  site: CmsSite;
  nav: CmsNavItem[];
  /** When true, floats over the homepage hero (mock). */
  overlay?: boolean;
}) {
  const session = await getSession();
  const authenticated = Boolean(session);
  const logoUrl = (site as { logoUrl?: string }).logoUrl || "/cms/logo-full-light.png";
  const logoMarkUrl = (site as { logoMarkUrl?: string }).logoMarkUrl || "/cms/logo-mark.svg";
  const applyLabel = (site as { applyCtaLabel?: string }).applyCtaLabel || "Apply Now";
  const applyHref = publicNavHref((site as { applyCtaHref?: string }).applyCtaHref || "/signup", authenticated);
  const loginLabel = (site as { loginCtaLabel?: string }).loginCtaLabel || "Login";

  return (
    <header
      className={
        // Same navy as MarketingFooter (`--navy-deep`) on every marketing page, including homepage overlay.
        overlay
          ? "absolute inset-x-0 top-0 z-50 bg-[var(--navy-deep)] text-white"
          : "relative z-50 bg-[var(--navy-deep)] text-white"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <BrandLogo
          brandName={site.brandName}
          lockupUrl={logoUrl}
          markUrl={logoMarkUrl}
          markClassName="h-9 w-auto max-w-[220px]"
        />

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const href = publicNavHref(item.href, authenticated);
            const isHome = item.href === "/";
            const showCaret = DROPDOWN_HREFS.has(item.href);
            return (
              <Link
                key={item.id}
                href={href}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium transition ${
                  isHome
                    ? "border-b-2 border-[var(--amber)] text-white"
                    : "text-white/85 hover:text-[var(--amber)]"
                }`}
              >
                {item.label}
                {showCaret ? <ChevronDown className="h-3.5 w-3.5 opacity-80" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-white/85 transition hover:bg-white/10 sm:inline-flex"
          >
            <Search className="h-4 w-4" />
          </button>
          {session ? (
            <Link
              href={session.role === "admin" ? "/admin" : "/app"}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/80 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <User className="h-4 w-4" />
              {session.role === "admin" ? "Admin" : "Dashboard"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-md border border-white/80 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {loginLabel}
            </Link>
          )}
          <Link
            href={applyHref}
            className="rounded-md bg-[var(--amber)] px-3.5 py-1.5 text-sm font-bold text-[var(--navy-deep)] transition hover:bg-[var(--amber-hot)]"
          >
            {applyLabel}
          </Link>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 lg:hidden">
        {nav.map((item) => (
          <Link
            key={item.id}
            href={publicNavHref(item.href, authenticated)}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
