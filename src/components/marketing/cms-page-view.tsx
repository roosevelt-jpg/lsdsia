import Link from "next/link";
import type { CmsPage, CmsSite, CmsNavItem } from "@prisma/client";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { resolveCmsImage } from "@/lib/cms";

function renderBody(markdown: string) {
  const lines = markdown.split("\n");
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("<a id=")) {
      const id = line.match(/id="([^"]+)"/)?.[1];
      nodes.push(<span key={i} id={id} className="block scroll-mt-24" />);
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="pt-4 font-[family-name:var(--font-marketing)] text-2xl font-bold text-[var(--navy)]">
          {line.replace(/^## /, "")}
        </h2>,
      );
      continue;
    }
    if (!line.trim()) {
      nodes.push(<div key={i} className="h-2" />);
      continue;
    }
    const chunks = line.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
      if (chunk.startsWith("**") && chunk.endsWith("**")) {
        return (
          <strong key={j} className="text-[var(--navy)]">
            {chunk.slice(2, -2)}
          </strong>
        );
      }
      return <span key={j}>{chunk}</span>;
    });
    nodes.push(
      <p key={i} className="leading-relaxed">
        {chunks}
      </p>,
    );
  }
  return nodes;
}

export function CmsPageView({
  site,
  nav,
  page,
  mediaMap,
}: {
  site: CmsSite;
  nav: CmsNavItem[];
  page: CmsPage;
  mediaMap: Record<string, string>;
}) {
  const heroImage = resolveCmsImage(page.heroImageUrl, mediaMap);

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-marketing)]">
      <MarketingHeader site={site} nav={nav} />
      <section className="relative overflow-hidden bg-[var(--navy-deep)] px-5 py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(230,168,23,0.18),transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl">
          {page.heroBadge && (
            <span className="inline-flex rounded-full bg-[#1a3a5c] px-3 py-1 text-xs font-semibold text-sky-100 ring-1 ring-sky-400/30">
              {page.heroBadge}
            </span>
          )}
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{page.heroTitle || page.title}</h1>
          {page.heroSubtitle && (
            <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">{page.heroSubtitle}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {page.ctaPrimaryLabel && (
              <Link
                href={page.ctaPrimaryHref || "/signup"}
                className="rounded-md bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
              >
                {page.ctaPrimaryLabel}
              </Link>
            )}
            {page.ctaSecondaryLabel && (
              <Link
                href={page.ctaSecondaryHref || "/"}
                className="rounded-md border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {page.ctaSecondaryLabel}
              </Link>
            )}
          </div>
        </div>
        {heroImage ? (
          <div className="relative mx-auto mt-10 max-w-6xl overflow-hidden rounded-xl ring-1 ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt="" className="max-h-72 w-full object-cover" />
          </div>
        ) : null}
      </section>

      <article className="mx-auto max-w-3xl px-5 py-14">
        <div className="space-y-4 text-[var(--steel)]">{renderBody(page.bodyMarkdown)}</div>
      </article>

      <MarketingFooter site={site} nav={nav} />
    </div>
  );
}
