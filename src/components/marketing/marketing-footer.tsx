import Link from "next/link";
import type { CmsNavItem, CmsSite } from "@prisma/client";
import { parseJsonArray } from "@/lib/cms";
import { BrandLogo } from "@/components/brand-logo";

type Social = { network: string; href: string };

const footerColumns = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Courses", href: "/programs" },
      { label: "Admissions", href: "/admissions" },
      { label: "Minnesota Training", href: "/about" },
      { label: "Testimonials", href: "/#testimonials" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Course Catalog", href: "/programs" },
      { label: "Licensing Guide", href: "/resources" },
      { label: "Business Launch Guide", href: "/app/school-launch" },
      { label: "FAQs", href: "/resources" },
      { label: "Blog", href: "/resources" },
      { label: "Student Support", href: "/app/support" },
    ],
  },
];

export function MarketingFooter({ site }: { site: CmsSite; nav: CmsNavItem[] }) {
  const social = parseJsonArray<Social>(site.socialJson, []);
  const logoUrl = (site as { logoUrl?: string }).logoUrl || "/cms/logo-full-light.png";
  const newsletterBlurb =
    (site as { newsletterBlurb?: string }).newsletterBlurb ||
    "Get training updates, new courses and special offers.";

  return (
    <footer className="bg-[var(--navy-deep)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.35fr_repeat(4,1fr)]">
        <div>
          <BrandLogo brandName={site.brandName} lockupUrl={logoUrl} markClassName="h-10 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{site.footerBlurb}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {social.map((s) => (
              <a
                key={s.network}
                href={s.href}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[10px] uppercase text-white/80 hover:border-[var(--amber)] hover:text-[var(--amber)]"
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">{col.title}</p>
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

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">Contact Us</p>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>{site.contactAddress}</li>
            <li>
              <a href={`tel:${site.contactPhone}`} className="hover:text-white">
                {site.contactPhone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contactEmail}`} className="hover:text-white">
                {site.contactEmail}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">Stay Updated</p>
          <p className="mt-3 text-sm text-white/70">{newsletterBlurb}</p>
          <form className="mt-4 flex overflow-hidden rounded-lg bg-white">
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              className="min-w-0 flex-1 px-3 py-2 text-sm text-[var(--navy)] outline-none"
              aria-label="Email for updates"
            />
            <button
              type="submit"
              className="bg-[var(--amber)] px-3 text-sm font-bold text-[var(--navy-deep)]"
              aria-label="Subscribe"
            >
              →
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{site.copyrightText}</p>
          <div className="flex gap-4">
            <Link href={site.privacyHref} className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href={site.termsHref} className="hover:text-white">
              Terms of Service
            </Link>
            <Link href={site.refundHref} className="hover:text-white">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
