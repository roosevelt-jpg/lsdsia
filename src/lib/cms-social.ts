export type SocialLink = { network: string; href: string };

export const SOCIAL_NETWORKS = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X (Twitter)" },
  { id: "tiktok", label: "TikTok" },
] as const;

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { network: "facebook", href: "https://facebook.com" },
  { network: "instagram", href: "https://instagram.com" },
  { network: "youtube", href: "https://youtube.com" },
  { network: "linkedin", href: "https://linkedin.com" },
];

export function parseSocialLinks(raw: string | null | undefined): SocialLink[] {
  try {
    const parsed = raw ? (JSON.parse(raw) as SocialLink[]) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((l) => l && typeof l.network === "string");
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_SOCIAL_LINKS.map((l) => ({ ...l }));
}

/** Map network → href for form defaults. */
export function socialHrefMap(links: SocialLink[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of links) {
    map[l.network.toLowerCase()] = l.href || "";
  }
  return map;
}

export function socialJsonFromForm(formData: FormData): string {
  const links: SocialLink[] = [];
  for (const n of SOCIAL_NETWORKS) {
    const href = String(formData.get(`social_${n.id}`) || "").trim();
    if (href) links.push({ network: n.id, href });
  }
  return JSON.stringify(links.length ? links : DEFAULT_SOCIAL_LINKS);
}
