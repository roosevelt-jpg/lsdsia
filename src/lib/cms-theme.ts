export type CmsTheme = {
  navy: string;
  navyDeep: string;
  amber: string;
  amberHot: string;
  heroGradient: string;
  ctaGradient: string;
  primaryBtnBg: string;
  primaryBtnText: string;
  secondaryBtnBorder: string;
  secondaryBtnText: string;
};

export const DEFAULT_CMS_THEME: CmsTheme = {
  navy: "#0B1F33",
  navyDeep: "#061526",
  amber: "#E6A817",
  amberHot: "#F0B92A",
  heroGradient: "linear-gradient(115deg,#061526 0%,#0B3A6E 55%,#1256A0 100%)",
  ctaGradient: "linear-gradient(115deg,#0B3A6E 0%,#1256A0 100%)",
  primaryBtnBg: "#E6A817",
  primaryBtnText: "#061526",
  secondaryBtnBorder: "#FFFFFF",
  secondaryBtnText: "#FFFFFF",
};

const COLOR_KEYS = [
  "navy",
  "navyDeep",
  "amber",
  "amberHot",
  "primaryBtnBg",
  "primaryBtnText",
  "secondaryBtnBorder",
  "secondaryBtnText",
] as const;

const TEXT_KEYS = ["heroGradient", "ctaGradient"] as const;

export function parseCmsTheme(raw: string | null | undefined): CmsTheme {
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<CmsTheme>) : {};
    return { ...DEFAULT_CMS_THEME, ...parsed };
  } catch {
    return { ...DEFAULT_CMS_THEME };
  }
}

/** Build themeJson from plain form fields (theme_navy, theme_heroGradient, …). */
export function themeJsonFromForm(formData: FormData): string {
  const theme: CmsTheme = { ...DEFAULT_CMS_THEME };
  for (const key of COLOR_KEYS) {
    const v = String(formData.get(`theme_${key}`) || "").trim();
    if (v) theme[key] = v;
  }
  for (const key of TEXT_KEYS) {
    const v = String(formData.get(`theme_${key}`) || "").trim();
    if (v) theme[key] = v;
  }
  return JSON.stringify(theme);
}

export const THEME_COLOR_FIELDS: { key: keyof CmsTheme; label: string }[] = [
  { key: "navy", label: "Navy" },
  { key: "navyDeep", label: "Navy deep" },
  { key: "amber", label: "Amber" },
  { key: "amberHot", label: "Amber hot" },
  { key: "primaryBtnBg", label: "Primary button background" },
  { key: "primaryBtnText", label: "Primary button text" },
  { key: "secondaryBtnBorder", label: "Secondary button border" },
  { key: "secondaryBtnText", label: "Secondary button text" },
];

export const THEME_TEXT_FIELDS: { key: keyof CmsTheme; label: string; hint?: string }[] = [
  { key: "heroGradient", label: "Hero gradient (CSS)", hint: "e.g. linear-gradient(...)" },
  { key: "ctaGradient", label: "CTA band gradient (CSS)" },
];
