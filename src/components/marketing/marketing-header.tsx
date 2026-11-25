import Link from "next/link";
import { Globe2, MapPin, User } from "lucide-react";
import { getSession } from "@/lib/auth";
import type { CmsNavItem, CmsSite } from "@prisma/client";
import { BrandLogo } from "@/components/brand-logo";

export async function MarketingHeader({
  site,
  nav,
}: {
  site: CmsSite;
  nav: CmsNavItem[];
}) {
  const session = await getSession();
  const logoUrl = (site as { logoUrl?: string }).logoUrl || "/cms/logo-full-light.png";
  const logoMarkUrl = (site as { logoMarkUrl?: string }).logoMarkUrl || "/cms/logo-mark.svg";
  const headerTagline =
    (site as { headerTagline?: string }).headerTagline || site.tagline ||
    "International Driving Instructor Training & Licensing";
  const metaLeft =
    (site as { headerMetaLeft?: string }).headerMetaLeft || "Worldwide Online Learning";
  const metaRight =
    (site as { headerMetaRight?: string }).headerMetaRight || "Minnesota Campus, USA";
  const applyLabel = (site as { applyCtaLabel?: string }).applyCtaLabel || "Apply Now";
  const applyHref = (site as { applyCtaHref?: string }).applyCtaHref || "/signup";
  const loginLabel = (site as { loginCtaLabel?: string }).loginCtaLabel || "Login";

  return (
    <header className="relative z-50 bg-[var(--navy-deep)] text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo
              brandName={site.brandName}
              lockupUrl={logoUrl}
              markUrl={logoMarkUrl}
              markClassName="h-9 w-auto"
            />
            <span className="hidden h-8 w-px bg-white/25 sm:block" aria-hidden />
            <p className="hidden max-w-[220px] text-[11px] leading-snug text-white/80 sm:block">
              {headerTagline}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-[var(--amber)]" />
              {metaLeft}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--amber)]" />
              {metaRight}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
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

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {session ? (
            <Link
              href={session.role === "admin" ? "/admin" : "/app"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/70 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <User className="h-4 w-4" />
              {session.role === "admin" ? "Admin" : "Dashboard"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/70 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <User className="h-4 w-4" />
              {loginLabel}
            </Link>
          )}
          <Link
            href={applyHref}
            className="rounded-lg bg-[var(--amber)] px-3.5 py-1.5 text-sm font-bold text-[var(--navy-deep)] transition hover:bg-[var(--amber-hot)]"
          >
            {applyLabel} →
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
