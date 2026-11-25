import { prisma } from "@/lib/db";

export type MaterialKind = "video" | "document" | "link";

export function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "").split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v") || u.pathname.split("/embed/")[1]?.split("/")[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function vimeoIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const part = u.pathname.split("/").filter(Boolean)[0];
    return part && /^\d+$/.test(part) ? part : null;
  } catch {
    return null;
  }
}

export function materialThumbnail(url: string, fallback?: string | null) {
  if (fallback) return fallback;
  const yt = youtubeIdFromUrl(url);
  if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
  return null;
}

export function normalizeMaterialUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Active materials for a candidate: all-level + their enrolled levels. */
export async function listMaterialsForUser(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "active" },
    select: { levelId: true },
  });
  const levelIds = enrollments.map((e) => e.levelId);
  if (levelIds.length === 0) return [];

  return prisma.learningMaterial.findMany({
    where: {
      isActive: true,
      OR: [{ levelId: null }, { levelId: { in: levelIds } }],
    },
    include: { level: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function listAllMaterialsAdmin() {
  return prisma.learningMaterial.findMany({
    include: { level: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}
