import { prisma } from "@/lib/db";
import { seedCms } from "@/lib/cms-seed";

export type CmsBundle = Awaited<ReturnType<typeof loadCmsBundle>>;

let cmsEnsurePromise: Promise<void> | null = null;

const CMS_CONTENT_VERSION = 8;

/** Ensure marketing CMS tables have the ChatGPT-mock defaults (idempotent). */
export async function ensureCmsDefaults() {
  if (!cmsEnsurePromise) {
    cmsEnsurePromise = (async () => {
      try {
        const home = await prisma.cmsPage.findUnique({ where: { slug: "home" } });
        const site = await prisma.cmsSite.findUnique({ where: { id: "default" } });
        const version = (site as { contentVersion?: number } | null)?.contentVersion ?? 0;
        if (!home || version < CMS_CONTENT_VERSION) {
          await seedCms(prisma);
        }
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

  // Backfill blank banner / logo URLs after schema upgrades
  const bannerDefaults: Record<string, string | number> = {};
  const s = site as Record<string, unknown>;
  if (!s.logoUrl) bannerDefaults.logoUrl = "/cms/logo-full-light.png";
  if (!s.logoMarkUrl) bannerDefaults.logoMarkUrl = "/cms/logo-mark.svg";
  if (!site.dashboardHeroBgUrl || site.dashboardHeroBgUrl.includes("hero-banner.jpg")) {
    bannerDefaults.dashboardHeroBgUrl = "/cms/dashboard/hero-bg-hires.jpg";
  }
  if (!site.dashboardHeroPersonUrl) bannerDefaults.dashboardHeroPersonUrl = "/cms/dashboard/hero-person.jpg";
  if (!site.dashboardHeroSubtitle) {
    bannerDefaults.dashboardHeroSubtitle =
      "Continue your journey to becoming a certified driving instructor with Life Star Instructors Academy.";
  }
  if (!site.dashboardUpgradeImageUrl) bannerDefaults.dashboardUpgradeImageUrl = "/cms/dashboard/upgrade-car.jpg";
  if (!site.dashboardContinueThumbUrl) bannerDefaults.dashboardContinueThumbUrl = "/cms/dashboard/continue-lesson.jpg";
  if (!s.dashboardHeroCtaLabel) bannerDefaults.dashboardHeroCtaLabel = "Continue Learning";
  if (!s.dashboardHeroSecondaryLabel) bannerDefaults.dashboardHeroSecondaryLabel = "View My Progress";
  if (!site.adminHeroBgUrl) bannerDefaults.adminHeroBgUrl = "/cms/admin/hero-banner.jpg";
  // Always prefer the sharp text-free admin banner crop.
  bannerDefaults.adminHeroBgUrl = "/cms/admin/hero-banner.jpg";
  if (!site.adminHeroPersonUrl) bannerDefaults.adminHeroPersonUrl = "/cms/admin/hero-person-hires.jpg";
  if (!site.adminPromoImageUrl) bannerDefaults.adminPromoImageUrl = "/cms/admin/promo-grow.jpg";
  if (!site.adminHeroTitle) bannerDefaults.adminHeroTitle = "Welcome to Life Star Instructors Academy";
  if (!site.adminHeroSubtitle) {
    bannerDefaults.adminHeroSubtitle =
      "Manage training, students, instructors and academy operations all in one place.";
  }
  if (!site.adminPromoTitle) bannerDefaults.adminPromoTitle = "Grow Your Driving School";
  if (!s.adminHeroCtaPrimaryLabel) bannerDefaults.adminHeroCtaPrimaryLabel = "New Enrollment";
  if (!s.adminHeroCtaSecondaryLabel) bannerDefaults.adminHeroCtaSecondaryLabel = "View Reports";
  if (!s.adminHeroCtaTertiaryLabel) bannerDefaults.adminHeroCtaTertiaryLabel = "Manage Courses";

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

/** Map legacy stock placeholders → ChatGPT mock crops (same subjects as designs). */
const MOCK_IMAGE_REMAP: Record<string, string> = {
  "/cms/hero-instructor.jpg": "/cms/hero-slide-1.jpg",
  "/cms/mock-hero-instructor.jpg": "/cms/hero-slide-1.jpg",
  "/cms/mock-auth-instructors.jpg": "/cms/hero-slide-2.jpg",
  "/cms/mock-auth-car.jpg": "/cms/hero-slide-3.jpg",
  "/cms/mock-campus-building.jpg": "/cms/hero-slide-4.jpg",
  "/cms/dashboard/hero-person.jpg": "/cms/hero-slide-5.jpg",
  "/cms/admin/hero-person-hires.jpg": "/cms/hero-slide-6.jpg",
  "/cms/program-cert.jpg": "/cms/mock-program-training.jpg",
  "/cms/mock-program-cert.jpg": "/cms/mock-program-training.jpg",
  "/cms/program-license.jpg": "/cms/mock-program-licensing.jpg",
  "/cms/mock-program-license.jpg": "/cms/mock-program-licensing.jpg",
  "/cms/program-business.jpg": "/cms/mock-program-business.jpg",
  "/cms/testimonial-1.jpg": "/cms/mock-testimonial-1.jpg",
  "/cms/testimonial-2.jpg": "/cms/mock-testimonial-2.jpg",
  "/cms/testimonial-3.jpg": "/cms/mock-testimonial-3.jpg",
  "/cms/cta-road.jpg": "/cms/mock-cta-car.jpg",
  "/cms/mock-cta-road.jpg": "/cms/mock-cta-car.jpg",
  "/cms/trusted-bg.jpg": "/cms/hero-slide-4.jpg",
  "/cms/mock-trusted-bg.jpg": "/cms/hero-slide-4.jpg",
  "/cms/auth-car.jpg": "/cms/mock-auth-car.jpg",
  "/cms/auth-instructors.jpg": "/cms/mock-auth-instructors.jpg",
  "/cms/auth-road.jpg": "/cms/mock-auth-road.jpg",
  "/cms/auth-welcome.jpg": "/cms/mock-auth-welcome.jpg",
};

export function resolveCmsImage(url: string, mediaMap: Record<string, string>) {
  if (!url) return "";
  if (url.startsWith("cms:")) {
    const key = url.slice(4);
    return mediaMap[key] || "";
  }
  return MOCK_IMAGE_REMAP[url] || url;
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
