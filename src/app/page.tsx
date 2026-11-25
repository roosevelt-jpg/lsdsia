import type { Metadata } from "next";
import { loadCmsBundle } from "@/lib/cms";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { HomeSections } from "@/components/marketing/home-sections";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { home } = await loadCmsBundle();
  return {
    title: home?.title || "Life Star Instructors Academy",
    description: home?.metaDescription || undefined,
  };
}

export default async function HomePage() {
  const { site, nav, home, programs, stats, testimonials, mediaMap } = await loadCmsBundle();

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-marketing)]">
      <HomeSections
        sections={home?.sections || []}
        programs={programs}
        stats={stats}
        testimonials={testimonials}
        mediaMap={mediaMap}
        header={<MarketingHeader site={site} nav={nav} overlay />}
      />
      <MarketingFooter site={site} nav={nav} />
    </div>
  );
}
