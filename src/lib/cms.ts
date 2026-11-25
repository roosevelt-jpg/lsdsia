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
