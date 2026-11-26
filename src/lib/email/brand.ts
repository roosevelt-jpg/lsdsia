/** Life Star outbound email brand + campus contact (prefs). */

export const EMAIL_BRAND = {
  name: "Life Star Instructors Academy",
  shortName: "Life Star",
  owner: "John Addo",
  address: "7240 Brooklyn Blvd, Minneapolis, MN 55429, United States",
  phone: "+1 763-390-7637",
  supportEmail: "info@lifestarinstructorsacademy.com",
  navy: "#0B1F33",
  navyDeep: "#061526",
  amber: "#E6A817",
  mist: "#eef2f7",
  logoUrl: "/cms/logo-full-light.png",
} as const;

export function appOrigin() {
  return (process.env.APP_URL || process.env.NEXTAUTH_URL || "https://lifestar.myflynai.com").replace(
    /\/$/,
    "",
  );
}

export function absoluteUrl(path: string) {
  const origin = appOrigin();
  if (path.startsWith("http")) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Display "From" — set EMAIL_FROM in Vercel (Resend Marketplace plugin binds RESEND_API_KEY). */
export function emailFromAddress() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    `${EMAIL_BRAND.name} <noreply@lifestarinstructorsacademy.com>`
  );
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
