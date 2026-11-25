import { prisma } from "@/lib/db";
import { seedCms } from "@/lib/cms-seed";

export type CmsBundle = Awaited<ReturnType<typeof loadCmsBundle>>;

let cmsEnsurePromise: Promise<void> | null = null;

/** Ensure marketing CMS tables have the ChatGPT-mock defaults (idempotent). */
export async function ensureCmsDefaults() {
  if (!cmsEnsurePromise) {
    cmsEnsurePromise = (async () => {
      try {
        const home = await prisma.cmsPage.findUnique({ where: { slug: "home" } });
        if (!home) await seedCms(prisma);
      } catch (err) {
        console.error("ensureCmsDefaults", err);
        cmsEnsurePromise = null;
      }
    })();
  }
  await cmsEnsurePromise;
}

export async function loadCmsSite() {
  await ensureCmsDefaults();
  let site = await prisma.cmsSite.findUnique({ where: { id: "default" } });
  if (!site) {
    site = await prisma.cmsSite.create({ data: { id: "default" } });
  }

  // Backfill blank banner URLs after schema upgrades (SQLite may keep empty strings)
  const bannerDefaults: Partial<typeof site> = {};
  if (!site.dashboardHeroBgUrl) bannerDefaults.dashboardHeroBgUrl = "/cms/dashboard/hero-bg-hires.jpg";
  if (!site.dashboardHeroPersonUrl) bannerDefaults.dashboardHeroPersonUrl = "/cms/dashboard/hero-person.jpg";
  if (!site.dashboardUpgradeImageUrl) bannerDefaults.dashboardUpgradeImageUrl = "/cms/dashboard/upgrade-car.jpg";
  if (!site.dashboardContinueThumbUrl) bannerDefaults.dashboardContinueThumbUrl = "/cms/dashboard/continue-lesson.jpg";
  if (!site.adminHeroBgUrl) bannerDefaults.adminHeroBgUrl = "/cms/admin/hero-banner.jpg";
  if (!site.adminHeroPersonUrl) bannerDefaults.adminHeroPersonUrl = "/cms/admin/hero-person-hires.jpg";
  if (!site.adminPromoImageUrl) bannerDefaults.adminPromoImageUrl = "/cms/admin/promo-grow.jpg";
  if (!site.adminHeroTitle) bannerDefaults.adminHeroTitle = "Welcome to Life Star Instructors Academy";
  if (!site.adminPromoTitle) bannerDefaults.adminPromoTitle = "Grow Your Driving School";

  if (Object.keys(bannerDefaults).length > 0) {
    site = await prisma.cmsSite.update({ where: { id: "default" }, data: bannerDefaults });
  }
  return site;
}

export async function loadCmsNav() {
  return prisma.cmsNavItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function loadCmsPage(slug: string) {
  await ensureCmsDefaults();
  return prisma.cmsPage.findUnique({
    where: { slug },
    include: { sections: { where: { published: true }, orderBy: { sortOrder: "asc" } } },
  });
}

export async function loadCmsBundle() {
  const [site, nav, home, programs, stats, testimonials, media] = await Promise.all([
    loadCmsSite(),
    loadCmsNav(),
    loadCmsPage("home"),
    prisma.cmsProgramCard.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.cmsStat.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.cmsTestimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.cmsMedia.findMany(),
  ]);

  const mediaMap = Object.fromEntries(media.map((m) => [m.key, `/api/cms-media/${m.key}`]));

  return { site, nav, home, programs, stats, testimonials, mediaMap };
}

export function resolveCmsImage(url: string, mediaMap: Record<string, string>) {
  if (!url) return "";
  if (url.startsWith("cms:")) {
    const key = url.slice(4);
    return mediaMap[key] || "";
  }
  return url;
}

export function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? (v as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function parseJsonObject<T extends Record<string, unknown>>(raw: string, fallback: T): T {
  try {
    const v = JSON.parse(raw || "{}");
    return v && typeof v === "object" ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}
