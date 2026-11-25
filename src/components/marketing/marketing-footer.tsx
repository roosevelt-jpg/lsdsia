import Link from "next/link";
import type { CmsNavItem, CmsSite } from "@prisma/client";
import { parseJsonArray } from "@/lib/cms";

type Social = { network: string; href: string };

const footerColumns = [
  {
    title: "Programs",
    links: [
      { label: "Instructor Certification", href: "/programs#certification" },
      { label: "License Preparation", href: "/programs#license" },
      { label: "Business Launch", href: "/programs#business" },
      { label: "Tuition & plans", href: "/pricing" },
    ],
  },
  {
    title: "Admissions",
    links: [
      { label: "How to apply", href: "/admissions" },
      { label: "Create account", href: "/signup" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Students",
    links: [
      { label: "Dashboard", href: "/students" },
      { label: "Certificate", href: "/app/certificate" },
      { label: "Open a school", href: "/app/school-launch" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Resources", href: "/resources" },
      { label: "Contact", href: "/resources" },
    ],
  },
];

export function MarketingFooter({ site, nav }: { site: CmsSite; nav: CmsNavItem[] }) {
  const social = parseJsonArray<Social>(site.socialJson, []);

  return (
    <footer className="bg-[var(--navy-deep)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--navy-deep)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M12 2.5l2.4 7.2h7.6l-6.2 4.5 2.4 7.3L12 17l-6.2 4.5 2.4-7.3L2 9.7h7.6L12 2.5z" />
              </svg>
            </span>
            <p className="font-[family-name:var(--font-marketing)] text-xs font-bold uppercase tracking-[0.12em]">
              {site.brandName}
            </p>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{site.footerBlurb}</p>
          <p className="mt-3 text-xs text-[var(--amber)]">Owner · {site.ownerName}</p>
          <div className="mt-5 flex gap-3">
            {social.map((s) => (
              <a
                key={s.network}
                href={s.href}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs uppercase text-white/80 hover:border-[var(--amber)] hover:text-[var(--amber)]"
                target="_blank"
                rel="noreferrer"
              >
                {s.network.slice(0, 2)}
              </a>
            ))}
          </div>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--amber)]">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm text-white/75 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{site.copyrightText}</p>
          <div className="flex flex-wrap gap-4">
            <span>{site.contactAddress}</span>
            <a href={`tel:${site.contactPhone}`} className="hover:text-white">
              {site.contactPhone}
            </a>
            <a href={`mailto:${site.contactEmail}`} className="hover:text-white">
              {site.contactEmail}
            </a>
          </div>
          <div className="flex gap-4">
            <Link href={site.privacyHref} className="hover:text-white">
              Privacy
            </Link>
            <Link href={site.termsHref} className="hover:text-white">
              Terms
            </Link>
            <Link href={site.refundHref} className="hover:text-white">
              Refund
            </Link>
          </div>
        </div>
        {/* keep nav typed usage for lint when columns are static */}
        <span className="sr-only">{nav.map((n) => n.label).join(" ")}</span>
      </div>
    </footer>
  );
}
