import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { CmsNavItem, CmsSite } from "@prisma/client";
import { parseJsonArray } from "@/lib/cms";
import { BrandLogo } from "@/components/brand-logo";
import { parseFooterColumns } from "@/lib/footer-nav";

type Social = { network: string; href: string };

const socialLabels: Record<string, string> = {
  facebook: "f",
  fb: "f",
  instagram: "ig",
  ig: "ig",
  youtube: "yt",
  yt: "yt",
  linkedin: "in",
  in: "in",
};

export function MarketingFooter({ site }: { site: CmsSite; nav: CmsNavItem[] }) {
  const social = parseJsonArray<Social>(site.socialJson, []);
  const columns = parseFooterColumns((site as { footerNavJson?: string }).footerNavJson);
  const logoUrl = (site as { logoUrl?: string }).logoUrl || "/cms/logo-full-light.png";
  const defaultSocial: Social[] =
    social.length > 0
      ? social
      : [
          { network: "facebook", href: "https://facebook.com" },
          { network: "instagram", href: "https://instagram.com" },
          { network: "youtube", href: "https://youtube.com" },
          { network: "linkedin", href: "https://linkedin.com" },
        ];

  return (
    <footer className="bg-[var(--navy-deep)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(4,0.9fr)_1.15fr]">
        <div>
          <BrandLogo brandName={site.brandName} lockupUrl={logoUrl} markClassName="h-10 w-auto max-w-[220px]" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            {site.footerBlurb || "Learn globally. Train professionally. Lead confidently."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {defaultSocial.map((s) => {
              const label = socialLabels[s.network.toLowerCase()] || s.network.slice(0, 2);
              return (
                <a
                  key={s.network + s.href}
                  href={s.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[10px] font-bold uppercase text-white/80 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.network}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm text-white/75 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">Contact Information</p>
          <ul className="mt-3 space-y-3 text-sm text-white/75">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]" />
              <span>
                {site.contactAddress || "7240 Brooklyn Blvd, Minneapolis, MN 55429, United States"}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]" />
              <a href={`tel:${site.contactPhone}`} className="hover:text-white">
                {site.contactPhone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]" />
              <a href={`mailto:${site.contactEmail}`} className="break-all hover:text-white">
                {site.contactEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{site.copyrightText}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={site.privacyHref} className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href={site.termsHref} className="hover:text-white">
              Terms of Use
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
