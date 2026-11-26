/** Helpers to edit CmsSection.dataJson via plain form fields (no raw JSON UI). */

export type HeroSlideField = { imageUrl: string; alt: string };

export type HeroSectionData = {
  eyebrow?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  slideIntervalMs?: number;
  slides?: HeroSlideField[];
  checks?: string[];
  tiles?: { title: string; body: string; icon: string }[];
};

export type TrustedSectionData = {
  pillars?: { title: string; body: string; icon: string }[];
};

export type CtaSectionData = {
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

function parseObject<T extends object>(raw: string | null | undefined, fallback: T): T {
  try {
    const parsed = raw ? (JSON.parse(raw) as T) : null;
    if (parsed && typeof parsed === "object") return { ...fallback, ...parsed };
  } catch {
    /* fall through */
  }
  return fallback;
}

export function parseHeroData(raw: string | null | undefined): HeroSectionData {
  const data = parseObject<HeroSectionData>(raw, {});
  const slides = [...(data.slides || [])];
  while (slides.length < 5) slides.push({ imageUrl: "", alt: "" });
  return {
    ...data,
    slides: slides.slice(0, 5),
    checks: data.checks || [],
    tiles: data.tiles || [],
  };
}

export function parseTrustedData(raw: string | null | undefined): TrustedSectionData {
  const data = parseObject<TrustedSectionData>(raw, {});
  const pillars = [...(data.pillars || [])];
  while (pillars.length < 4) pillars.push({ title: "", body: "", icon: "trophy" });
  return { pillars: pillars.slice(0, 4) };
}

export function parseCtaData(raw: string | null | undefined): CtaSectionData {
  return parseObject<CtaSectionData>(raw, {});
}

export function heroDataJsonFromForm(formData: FormData, existingRaw: string): string {
  const existing = parseObject<HeroSectionData>(existingRaw, {});
  const slides: HeroSlideField[] = [];
  for (let i = 0; i < 5; i++) {
    const imageUrl = String(formData.get(`hero_slide_${i}_imageUrl`) || "").trim();
    const alt = String(formData.get(`hero_slide_${i}_alt`) || "").trim();
    if (imageUrl) slides.push({ imageUrl, alt });
  }
  const checks = String(formData.get("hero_checks") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const tiles = [...(existing.tiles || [])];
  for (let i = 0; i < 3; i++) {
    const title = String(formData.get(`hero_tile_${i}_title`) || "").trim();
    const body = String(formData.get(`hero_tile_${i}_body`) || "").trim();
    const icon = String(formData.get(`hero_tile_${i}_icon`) || "").trim() || "laptop";
    if (title || body) {
      tiles[i] = { title, body, icon };
    }
  }
  const interval = Number(formData.get("hero_slideIntervalMs") || existing.slideIntervalMs || 6500);
  return JSON.stringify({
    ...existing,
    eyebrow: String(formData.get("hero_data_eyebrow") || existing.eyebrow || "").trim(),
    secondaryCtaLabel: String(formData.get("hero_secondaryCtaLabel") || "").trim(),
    secondaryCtaHref: String(formData.get("hero_secondaryCtaHref") || "").trim(),
    slideIntervalMs: Number.isFinite(interval) && interval > 0 ? interval : 6500,
    slides,
    checks: checks.length ? checks : existing.checks,
    tiles: tiles.filter((t) => t && (t.title || t.body)),
  });
}

export function trustedDataJsonFromForm(formData: FormData, existingRaw: string): string {
  const existing = parseObject<TrustedSectionData>(existingRaw, {});
  const pillars = [];
  for (let i = 0; i < 4; i++) {
    const title = String(formData.get(`trusted_pillar_${i}_title`) || "").trim();
    const body = String(formData.get(`trusted_pillar_${i}_body`) || "").trim();
    const icon = String(formData.get(`trusted_pillar_${i}_icon`) || "").trim() || "trophy";
    if (title || body) pillars.push({ title, body, icon });
  }
  return JSON.stringify({ ...existing, pillars });
}

export function ctaDataJsonFromForm(formData: FormData, existingRaw: string): string {
  const existing = parseObject<CtaSectionData>(existingRaw, {});
  return JSON.stringify({
    ...existing,
    secondaryCtaLabel: String(formData.get("cta_secondaryCtaLabel") || "").trim(),
    secondaryCtaHref: String(formData.get("cta_secondaryCtaHref") || "").trim(),
  });
}
