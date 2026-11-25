import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadCmsBundle, loadCmsPage } from "@/lib/cms";
import { CmsPageView } from "@/components/marketing/cms-page-view";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadCmsPage("resources");
  return { title: page?.title || "Resources", description: page?.metaDescription };
}

export default async function MarketingResourcesPage() {
  const [{ site, nav, mediaMap }, page] = await Promise.all([loadCmsBundle(), loadCmsPage("resources")]);
  if (!page || !page.published) notFound();
  return <CmsPageView site={site} nav={nav} page={page} mediaMap={mediaMap} />;
}
