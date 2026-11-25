import type { Metadata } from "next";
import { loadCmsBundle, loadCmsPage } from "@/lib/cms";
import { CmsPageView } from "@/components/marketing/cms-page-view";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadCmsPage("programs");
  return { title: page?.title || "Programs", description: page?.metaDescription };
}

export default async function ProgramsPage() {
  const [{ site, nav, mediaMap }, page] = await Promise.all([loadCmsBundle(), loadCmsPage("programs")]);
  if (!page || !page.published) notFound();
  return <CmsPageView site={site} nav={nav} page={page} mediaMap={mediaMap} />;
}
