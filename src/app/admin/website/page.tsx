import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureCmsDefaults } from "@/lib/cms";
import { saveCmsMedia } from "@/lib/cms-media";
import { footerColumnsForForm, footerNavJsonFromForm } from "@/lib/cms-footer-form";
import {
  ctaDataJsonFromForm,
  heroDataJsonFromForm,
  parseCtaData,
  parseHeroData,
  parseTrustedData,
  trustedDataJsonFromForm,
} from "@/lib/cms-section-data";
import { SOCIAL_NETWORKS, parseSocialLinks, socialHrefMap, socialJsonFromForm } from "@/lib/cms-social";
import {
  THEME_COLOR_FIELDS,
  THEME_TEXT_FIELDS,
  parseCmsTheme,
  themeJsonFromForm,
} from "@/lib/cms-theme";
import { CmsColorField } from "@/components/admin/cms-color-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";


async function saveSite(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const themeJson = themeJsonFromForm(formData);
  const socialJson = socialJsonFromForm(formData);
  const footerNavJson = footerNavJsonFromForm(formData);
  const payload = {
    brandName: String(formData.get("brandName") || ""),
    tagline: String(formData.get("tagline") || ""),
    logoUrl: String(formData.get("logoUrl") || "/cms/logo-full-light.png"),
    logoMarkUrl: String(formData.get("logoMarkUrl") || "/cms/logo-mark.svg"),
    headerTagline: String(formData.get("headerTagline") || ""),
    headerMetaLeft: String(formData.get("headerMetaLeft") || ""),
    headerMetaRight: String(formData.get("headerMetaRight") || ""),
    applyCtaLabel: String(formData.get("applyCtaLabel") || "Apply Now"),
    applyCtaHref: String(formData.get("applyCtaHref") || "/signup"),
    loginCtaLabel: String(formData.get("loginCtaLabel") || "Login"),
    themeJson,
    contactAddress: String(formData.get("contactAddress") || ""),
    contactPhone: String(formData.get("contactPhone") || ""),
    contactEmail: String(formData.get("contactEmail") || ""),
    ownerName: String(formData.get("ownerName") || "John Addo"),
    footerBlurb: String(formData.get("footerBlurb") || ""),
    copyrightText: String(formData.get("copyrightText") || ""),
    newsletterBlurb: String(formData.get("newsletterBlurb") || ""),
    socialJson,
    footerNavJson,
  };
  await prisma.cmsSite.upsert({
    where: { id: "default" },
    create: { id: "default", ...payload },
    update: payload,
  });
  redirect("/admin/website?saved=site");
}

async function saveDashboardBanners(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  await prisma.cmsSite.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      dashboardTagline: String(formData.get("dashboardTagline") || ""),
      dashboardHeroSubtitle: String(formData.get("dashboardHeroSubtitle") || ""),
      dashboardHeroBgUrl: String(formData.get("dashboardHeroBgUrl") || ""),
      dashboardHeroPersonUrl: String(formData.get("dashboardHeroPersonUrl") || ""),
      dashboardUpgradeImageUrl: String(formData.get("dashboardUpgradeImageUrl") || ""),
      dashboardContinueThumbUrl: String(formData.get("dashboardContinueThumbUrl") || ""),
      dashboardUpgradeTitle: String(formData.get("dashboardUpgradeTitle") || ""),
      dashboardUpgradeBody: String(formData.get("dashboardUpgradeBody") || ""),
      dashboardUpgradeCtaLabel: String(formData.get("dashboardUpgradeCtaLabel") || ""),
      dashboardUpgradeCtaHref: String(formData.get("dashboardUpgradeCtaHref") || ""),
      dashboardHeroCtaLabel: String(formData.get("dashboardHeroCtaLabel") || "Continue Learning"),
      dashboardHeroCtaHref: String(formData.get("dashboardHeroCtaHref") || "/app/learn"),
      dashboardHeroSecondaryLabel: String(formData.get("dashboardHeroSecondaryLabel") || "View My Progress"),
      dashboardHeroSecondaryHref: String(formData.get("dashboardHeroSecondaryHref") || "/app"),
    },
    update: {
      dashboardTagline: String(formData.get("dashboardTagline") || ""),
      dashboardHeroSubtitle: String(formData.get("dashboardHeroSubtitle") || ""),
      dashboardHeroBgUrl: String(formData.get("dashboardHeroBgUrl") || ""),
      dashboardHeroPersonUrl: String(formData.get("dashboardHeroPersonUrl") || ""),
      dashboardUpgradeImageUrl: String(formData.get("dashboardUpgradeImageUrl") || ""),
      dashboardContinueThumbUrl: String(formData.get("dashboardContinueThumbUrl") || ""),
      dashboardUpgradeTitle: String(formData.get("dashboardUpgradeTitle") || ""),
      dashboardUpgradeBody: String(formData.get("dashboardUpgradeBody") || ""),
      dashboardUpgradeCtaLabel: String(formData.get("dashboardUpgradeCtaLabel") || ""),
      dashboardUpgradeCtaHref: String(formData.get("dashboardUpgradeCtaHref") || ""),
      dashboardHeroCtaLabel: String(formData.get("dashboardHeroCtaLabel") || "Continue Learning"),
      dashboardHeroCtaHref: String(formData.get("dashboardHeroCtaHref") || "/app/learn"),
      dashboardHeroSecondaryLabel: String(formData.get("dashboardHeroSecondaryLabel") || "View My Progress"),
      dashboardHeroSecondaryHref: String(formData.get("dashboardHeroSecondaryHref") || "/app"),
    },
  });
  redirect("/admin/website?saved=dashboard");
}

async function saveAdminDashboardBanners(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  await prisma.cmsSite.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      adminHeroTitle: String(formData.get("adminHeroTitle") || ""),
      adminHeroSubtitle: String(formData.get("adminHeroSubtitle") || ""),
      adminHeroBgUrl: String(formData.get("adminHeroBgUrl") || ""),
      adminHeroPersonUrl: String(formData.get("adminHeroPersonUrl") || ""),
      adminPromoTitle: String(formData.get("adminPromoTitle") || ""),
      adminPromoBody: String(formData.get("adminPromoBody") || ""),
      adminPromoImageUrl: String(formData.get("adminPromoImageUrl") || ""),
      adminPromoCtaLabel: String(formData.get("adminPromoCtaLabel") || ""),
      adminPromoCtaHref: String(formData.get("adminPromoCtaHref") || ""),
      adminHeroCtaPrimaryLabel: String(formData.get("adminHeroCtaPrimaryLabel") || "New Enrollment"),
      adminHeroCtaPrimaryHref: String(formData.get("adminHeroCtaPrimaryHref") || "/admin/candidates"),
      adminHeroCtaSecondaryLabel: String(formData.get("adminHeroCtaSecondaryLabel") || "View Reports"),
      adminHeroCtaSecondaryHref: String(formData.get("adminHeroCtaSecondaryHref") || "/admin"),
      adminHeroCtaTertiaryLabel: String(formData.get("adminHeroCtaTertiaryLabel") || "Manage Courses"),
      adminHeroCtaTertiaryHref: String(formData.get("adminHeroCtaTertiaryHref") || "/admin/content"),
    },
    update: {
      adminHeroTitle: String(formData.get("adminHeroTitle") || ""),
      adminHeroSubtitle: String(formData.get("adminHeroSubtitle") || ""),
      adminHeroBgUrl: String(formData.get("adminHeroBgUrl") || ""),
      adminHeroPersonUrl: String(formData.get("adminHeroPersonUrl") || ""),
      adminPromoTitle: String(formData.get("adminPromoTitle") || ""),
      adminPromoBody: String(formData.get("adminPromoBody") || ""),
      adminPromoImageUrl: String(formData.get("adminPromoImageUrl") || ""),
      adminPromoCtaLabel: String(formData.get("adminPromoCtaLabel") || ""),
      adminPromoCtaHref: String(formData.get("adminPromoCtaHref") || ""),
      adminHeroCtaPrimaryLabel: String(formData.get("adminHeroCtaPrimaryLabel") || "New Enrollment"),
      adminHeroCtaPrimaryHref: String(formData.get("adminHeroCtaPrimaryHref") || "/admin/candidates"),
      adminHeroCtaSecondaryLabel: String(formData.get("adminHeroCtaSecondaryLabel") || "View Reports"),
      adminHeroCtaSecondaryHref: String(formData.get("adminHeroCtaSecondaryHref") || "/admin"),
      adminHeroCtaTertiaryLabel: String(formData.get("adminHeroCtaTertiaryLabel") || "Manage Courses"),
      adminHeroCtaTertiaryHref: String(formData.get("adminHeroCtaTertiaryHref") || "/admin/content"),
    },
  });
  redirect("/admin/website?saved=admin-dashboard");
}

async function savePage(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/website");
  await prisma.cmsPage.update({
    where: { id },
    data: {
      title: String(formData.get("title") || ""),
      metaDescription: String(formData.get("metaDescription") || ""),
      heroBadge: String(formData.get("heroBadge") || ""),
      heroTitle: String(formData.get("heroTitle") || ""),
      heroSubtitle: String(formData.get("heroSubtitle") || ""),
      heroImageUrl: String(formData.get("heroImageUrl") || ""),
      bodyMarkdown: String(formData.get("bodyMarkdown") || ""),
      ctaPrimaryLabel: String(formData.get("ctaPrimaryLabel") || ""),
      ctaPrimaryHref: String(formData.get("ctaPrimaryHref") || ""),
      ctaSecondaryLabel: String(formData.get("ctaSecondaryLabel") || ""),
      ctaSecondaryHref: String(formData.get("ctaSecondaryHref") || ""),
    },
  });
  redirect("/admin/website?saved=page");
}

async function saveProgram(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  await prisma.cmsProgramCard.update({
    where: { id },
    data: {
      title: String(formData.get("title") || ""),
      blurb: String(formData.get("blurb") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      href: String(formData.get("href") || ""),
    },
  });
  redirect("/admin/website?saved=program");
}

async function saveStat(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  await prisma.cmsStat.update({
    where: { id },
    data: {
      value: String(formData.get("value") || ""),
      label: String(formData.get("label") || ""),
    },
  });
  redirect("/admin/website?saved=stat");
}

async function saveTestimonial(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  await prisma.cmsTestimonial.update({
    where: { id },
    data: {
      quote: String(formData.get("quote") || ""),
      name: String(formData.get("name") || ""),
      title: String(formData.get("title") || ""),
      photoUrl: String(formData.get("photoUrl") || ""),
      stars: Number(formData.get("stars") || 5),
    },
  });
  redirect("/admin/website?saved=testimonial");
}

async function saveSection(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  const existing = await prisma.cmsSection.findUnique({ where: { id } });
  if (!existing) redirect("/admin/website?error=" + encodeURIComponent("Section not found."));

  let dataJson = existing.dataJson || "{}";
  if (existing.key === "hero") dataJson = heroDataJsonFromForm(formData, dataJson);
  else if (existing.key === "trusted") dataJson = trustedDataJsonFromForm(formData, dataJson);
  else if (existing.key === "cta") dataJson = ctaDataJsonFromForm(formData, dataJson);

  await prisma.cmsSection.update({
    where: { id },
    data: {
      eyebrow: String(formData.get("eyebrow") || ""),
      title: String(formData.get("title") || ""),
      subtitle: String(formData.get("subtitle") || ""),
      body: String(formData.get("body") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      ctaLabel: String(formData.get("ctaLabel") || ""),
      ctaHref: String(formData.get("ctaHref") || ""),
      dataJson,
    },
  });
  redirect("/admin/website?saved=section");
}

async function uploadMedia(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const key = String(formData.get("key") || "").trim();
  const label = String(formData.get("label") || key);
  const file = formData.get("file");
  if (!key || !(file instanceof File) || file.size <= 0) {
    redirect("/admin/website?error=" + encodeURIComponent("Media key and image file are required."));
  }
  try {
    await saveCmsMedia({ key, label, file });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    redirect("/admin/website?error=" + encodeURIComponent(msg));
  }
  // Point common keys at CMS media URL
  if (key === "hero_image") {
    const home = await prisma.cmsPage.findUnique({ where: { slug: "home" } });
    if (home) {
      await prisma.cmsPage.update({ where: { id: home.id }, data: { heroImageUrl: `cms:${key}` } });
      await prisma.cmsSection.updateMany({
        where: { pageId: home.id, key: "hero" },
        data: { imageUrl: `cms:${key}` },
      });
    }
  }
  const mediaFieldByKey: Record<
    string,
    | "dashboardHeroBgUrl"
    | "dashboardHeroPersonUrl"
    | "dashboardUpgradeImageUrl"
    | "dashboardContinueThumbUrl"
    | "adminHeroBgUrl"
    | "adminHeroPersonUrl"
    | "adminPromoImageUrl"
  > = {
    dashboard_hero_bg: "dashboardHeroBgUrl",
    dashboard_hero_person: "dashboardHeroPersonUrl",
    dashboard_upgrade: "dashboardUpgradeImageUrl",
    dashboard_continue_thumb: "dashboardContinueThumbUrl",
    admin_hero_bg: "adminHeroBgUrl",
    admin_hero_person: "adminHeroPersonUrl",
    admin_promo: "adminPromoImageUrl",
  };
  const field = mediaFieldByKey[key];
  if (field) {
    await prisma.cmsSite.upsert({
      where: { id: "default" },
      create: { id: "default", [field]: `cms:${key}` },
      update: { [field]: `cms:${key}` },
    });
  }
  redirect("/admin/website?saved=media");
}

export default async function AdminWebsiteCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireUser(["admin"]);
  await ensureCmsDefaults();
  const sp = await searchParams;

  const [site, pages, programs, stats, testimonials, media, homeSections] = await Promise.all([
    prisma.cmsSite.findUnique({ where: { id: "default" } }),
    prisma.cmsPage.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.cmsProgramCard.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.cmsStat.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.cmsTestimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.cmsMedia.findMany({ orderBy: { key: "asc" } }),
    prisma.cmsSection.findMany({
      where: { page: { slug: "home" } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const theme = parseCmsTheme(site?.themeJson);
  const socialMap = socialHrefMap(parseSocialLinks(site?.socialJson));
  const footerCols = footerColumnsForForm((site as { footerNavJson?: string } | null)?.footerNavJson);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--steel)]">Marketing CMS</p>
        <h1 className="font-display text-3xl text-[var(--navy)]">Website content</h1>
        <p className="mt-2 text-sm text-[var(--steel)]">
          Manage public marketing pages, hero imagery, programs, stats, and testimonials. Seeded defaults match the
          ChatGPT Life Star mock.{" "}
          <Link href="/" className="text-[var(--navy)] underline" target="_blank">
            View site
          </Link>
        </p>
      </div>

      {sp.saved && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Saved ({sp.saved}).</p>
      )}
      {sp.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{sp.error}</p>}

      <Card className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Site chrome & contact</h2>
        <form action={saveSite} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Brand name</Label>
            <Input name="brandName" defaultValue={site?.brandName ?? ""} required />
          </div>
          <div className="sm:col-span-2">
            <Label>Tagline</Label>
            <Input name="tagline" defaultValue={site?.tagline ?? ""} />
          </div>
          <div>
            <Label>Logo lockup URL</Label>
            <Input name="logoUrl" defaultValue={(site as { logoUrl?: string } | null)?.logoUrl ?? "/cms/logo-full-light.png"} />
          </div>
          <div>
            <Label>Logo mark URL</Label>
            <Input name="logoMarkUrl" defaultValue={(site as { logoMarkUrl?: string } | null)?.logoMarkUrl ?? "/cms/logo-mark.svg"} />
          </div>
          <div className="sm:col-span-2">
            <Label>Header tagline</Label>
            <Input name="headerTagline" defaultValue={(site as { headerTagline?: string } | null)?.headerTagline ?? ""} />
          </div>
          <div>
            <Label>Header meta left</Label>
            <Input name="headerMetaLeft" defaultValue={(site as { headerMetaLeft?: string } | null)?.headerMetaLeft ?? ""} />
          </div>
          <div>
            <Label>Header meta right</Label>
            <Input name="headerMetaRight" defaultValue={(site as { headerMetaRight?: string } | null)?.headerMetaRight ?? ""} />
          </div>
          <div>
            <Label>Apply CTA label</Label>
            <Input name="applyCtaLabel" defaultValue={(site as { applyCtaLabel?: string } | null)?.applyCtaLabel ?? "Apply Now"} />
          </div>
          <div>
            <Label>Apply CTA href</Label>
            <Input name="applyCtaHref" defaultValue={(site as { applyCtaHref?: string } | null)?.applyCtaHref ?? "/signup"} />
          </div>
          <div>
            <Label>Login CTA label</Label>
            <Input name="loginCtaLabel" defaultValue={(site as { loginCtaLabel?: string } | null)?.loginCtaLabel ?? "Login"} />
          </div>
          <div>
            <Label>Newsletter blurb</Label>
            <Input name="newsletterBlurb" defaultValue={(site as { newsletterBlurb?: string } | null)?.newsletterBlurb ?? ""} />
          </div>
          <div className="sm:col-span-2 space-y-3 rounded-xl border border-[var(--navy)]/10 bg-[var(--mist)]/40 p-4">
            <div>
              <p className="text-sm font-semibold text-[var(--navy)]">Theme colors & styles</p>
              <p className="text-xs text-[var(--steel)]">Stored as JSON under the hood — edit with pickers and plain fields.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {THEME_COLOR_FIELDS.map((f) => (
                <CmsColorField key={f.key} name={`theme_${f.key}`} label={f.label} defaultValue={theme[f.key]} />
              ))}
            </div>
            <div className="grid gap-3">
              {THEME_TEXT_FIELDS.map((f) => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  <Input name={`theme_${f.key}`} defaultValue={theme[f.key]} className="font-mono text-xs" />
                  {f.hint && <p className="mt-1 text-[11px] text-[var(--steel)]">{f.hint}</p>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>Owner name</Label>
            <Input name="ownerName" defaultValue={site?.ownerName ?? "John Addo"} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input name="contactPhone" defaultValue={site?.contactPhone ?? ""} />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="contactEmail" defaultValue={site?.contactEmail ?? ""} />
          </div>
          <div>
            <Label>Address</Label>
            <Input name="contactAddress" defaultValue={site?.contactAddress ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label>Footer blurb</Label>
            <textarea
              name="footerBlurb"
              defaultValue={site?.footerBlurb ?? ""}
              className="mt-1 min-h-20 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 space-y-3 rounded-xl border border-[var(--navy)]/10 bg-[var(--mist)]/40 p-4">
            <div>
              <p className="text-sm font-semibold text-[var(--navy)]">Social links</p>
              <p className="text-xs text-[var(--steel)]">Leave blank to omit a network from the footer.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_NETWORKS.map((n) => (
                <div key={n.id}>
                  <Label>{n.label} URL</Label>
                  <Input
                    name={`social_${n.id}`}
                    type="url"
                    placeholder={`https://${n.id}.com/...`}
                    defaultValue={socialMap[n.id] || ""}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 space-y-4 rounded-xl border border-[var(--navy)]/10 bg-[var(--mist)]/40 p-4">
            <div>
              <p className="text-sm font-semibold text-[var(--navy)]">Footer menus</p>
              <p className="text-xs text-[var(--steel)]">Programs / Admissions / Students / About — label + link per row.</p>
            </div>
            {footerCols.map((col, c) => (
              <div key={c} className="space-y-2 rounded-lg border border-[var(--navy)]/8 bg-white p-3">
                <div>
                  <Label>Column {c + 1} title</Label>
                  <Input name={`footer_col_${c}_title`} defaultValue={col.title} />
                </div>
                <div className="grid gap-2">
                  {col.links.map((link, l) => (
                    <div key={l} className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Link {l + 1} label</Label>
                        <Input name={`footer_col_${c}_link_${l}_label`} defaultValue={link.label} />
                      </div>
                      <div>
                        <Label className="text-xs">Link {l + 1} URL</Label>
                        <Input name={`footer_col_${c}_link_${l}_href`} defaultValue={link.href} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="sm:col-span-2">
            <Label>Copyright</Label>
            <Input name="copyrightText" defaultValue={site?.copyrightText ?? ""} />
          </div>
          <Button type="submit">Save site settings</Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Candidate dashboard banners</h2>
        <p className="text-sm text-[var(--steel)]">
          Replace hero background, instructor cutout, upgrade card image, and continue-learning thumbnail anytime.
          Defaults use assets extracted from the ChatGPT dashboard mock under <code className="text-xs">/cms/dashboard/</code>.
          Paste a path like <code className="text-xs">/cms/dashboard/hero-bg-hires.jpg</code> or{" "}
          <code className="text-xs">cms:dashboard_hero_bg</code> after uploading media with that key.
        </p>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Hero BG", src: site?.dashboardHeroBgUrl },
            { label: "Hero person", src: site?.dashboardHeroPersonUrl },
            { label: "Upgrade", src: site?.dashboardUpgradeImageUrl },
            { label: "Continue", src: site?.dashboardContinueThumbUrl },
          ].map((p) => (
            <div key={p.label} className="overflow-hidden rounded-lg border border-[var(--navy)]/10 bg-[var(--mist)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src?.startsWith("cms:") ? `/api/cms-media/${p.src.slice(4)}` : p.src || ""}
                alt=""
                className="h-20 w-full object-cover"
              />
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--steel)]">{p.label}</p>
            </div>
          ))}
        </div>
        <form action={saveDashboardBanners} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Sidebar tagline</Label>
            <Input name="dashboardTagline" defaultValue={site?.dashboardTagline ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label>Hero subtitle</Label>
            <textarea
              name="dashboardHeroSubtitle"
              defaultValue={site?.dashboardHeroSubtitle ?? ""}
              className="mt-1 min-h-16 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label>Hero background URL</Label>
            <Input name="dashboardHeroBgUrl" defaultValue={site?.dashboardHeroBgUrl ?? ""} />
          </div>
          <div>
            <Label>Hero person/car URL</Label>
            <Input name="dashboardHeroPersonUrl" defaultValue={site?.dashboardHeroPersonUrl ?? ""} />
          </div>
          <div>
            <Label>Upgrade card image URL</Label>
            <Input name="dashboardUpgradeImageUrl" defaultValue={site?.dashboardUpgradeImageUrl ?? ""} />
          </div>
          <div>
            <Label>Continue-learning thumb URL</Label>
            <Input name="dashboardContinueThumbUrl" defaultValue={site?.dashboardContinueThumbUrl ?? ""} />
          </div>
          <div>
            <Label>Upgrade title</Label>
            <Input name="dashboardUpgradeTitle" defaultValue={site?.dashboardUpgradeTitle ?? ""} />
          </div>
          <div>
            <Label>Upgrade CTA label</Label>
            <Input name="dashboardUpgradeCtaLabel" defaultValue={site?.dashboardUpgradeCtaLabel ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label>Upgrade benefits (one per line)</Label>
            <textarea
              name="dashboardUpgradeBody"
              defaultValue={site?.dashboardUpgradeBody ?? ""}
              className="mt-1 min-h-20 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Upgrade CTA href</Label>
            <Input name="dashboardUpgradeCtaHref" defaultValue={site?.dashboardUpgradeCtaHref ?? ""} />
          </div>
          <div>
            <Label>Hero primary CTA label</Label>
            <Input name="dashboardHeroCtaLabel" defaultValue={(site as { dashboardHeroCtaLabel?: string } | null)?.dashboardHeroCtaLabel ?? "Continue Learning"} />
          </div>
          <div>
            <Label>Hero primary CTA href</Label>
            <Input name="dashboardHeroCtaHref" defaultValue={(site as { dashboardHeroCtaHref?: string } | null)?.dashboardHeroCtaHref ?? "/app/learn"} />
          </div>
          <div>
            <Label>Hero secondary CTA label</Label>
            <Input name="dashboardHeroSecondaryLabel" defaultValue={(site as { dashboardHeroSecondaryLabel?: string } | null)?.dashboardHeroSecondaryLabel ?? "View My Progress"} />
          </div>
          <div>
            <Label>Hero secondary CTA href</Label>
            <Input name="dashboardHeroSecondaryHref" defaultValue={(site as { dashboardHeroSecondaryHref?: string } | null)?.dashboardHeroSecondaryHref ?? "/app"} />
          </div>
          <Button type="submit" variant="outline">
            Save dashboard banners
          </Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Super-admin dashboard banners</h2>
        <p className="text-sm text-[var(--steel)]">
          Replace the administrator welcome hero and “Grow Your Driving School” promo card anytime. Defaults use assets
          under <code className="text-xs">/cms/admin/</code> extracted from the ChatGPT admin mock.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Hero BG", src: site?.adminHeroBgUrl },
            { label: "Hero person", src: site?.adminHeroPersonUrl },
            { label: "Promo", src: site?.adminPromoImageUrl },
          ].map((p) => (
            <div key={p.label} className="overflow-hidden rounded-lg border border-[var(--navy)]/10 bg-[var(--mist)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src?.startsWith("cms:") ? `/api/cms-media/${p.src.slice(4)}` : p.src || ""}
                alt=""
                className="h-20 w-full object-cover"
              />
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--steel)]">{p.label}</p>
            </div>
          ))}
        </div>
        <form action={saveAdminDashboardBanners} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Hero title</Label>
            <Input name="adminHeroTitle" defaultValue={site?.adminHeroTitle ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label>Hero subtitle</Label>
            <textarea
              name="adminHeroSubtitle"
              defaultValue={site?.adminHeroSubtitle ?? ""}
              className="mt-1 min-h-16 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label>Hero background URL</Label>
            <Input name="adminHeroBgUrl" defaultValue={site?.adminHeroBgUrl ?? ""} />
          </div>
          <div>
            <Label>Hero person URL</Label>
            <Input name="adminHeroPersonUrl" defaultValue={site?.adminHeroPersonUrl ?? ""} />
          </div>
          <div>
            <Label>Promo title</Label>
            <Input name="adminPromoTitle" defaultValue={site?.adminPromoTitle ?? ""} />
          </div>
          <div>
            <Label>Promo CTA label</Label>
            <Input name="adminPromoCtaLabel" defaultValue={site?.adminPromoCtaLabel ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label>Promo body</Label>
            <textarea
              name="adminPromoBody"
              defaultValue={site?.adminPromoBody ?? ""}
              className="mt-1 min-h-16 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label>Promo image URL</Label>
            <Input name="adminPromoImageUrl" defaultValue={site?.adminPromoImageUrl ?? ""} />
          </div>
          <div>
            <Label>Promo CTA href</Label>
            <Input name="adminPromoCtaHref" defaultValue={site?.adminPromoCtaHref ?? ""} />
          </div>
          <div>
            <Label>Hero CTA 1 label</Label>
            <Input name="adminHeroCtaPrimaryLabel" defaultValue={(site as { adminHeroCtaPrimaryLabel?: string } | null)?.adminHeroCtaPrimaryLabel ?? "New Enrollment"} />
          </div>
          <div>
            <Label>Hero CTA 1 href</Label>
            <Input name="adminHeroCtaPrimaryHref" defaultValue={(site as { adminHeroCtaPrimaryHref?: string } | null)?.adminHeroCtaPrimaryHref ?? "/admin/candidates"} />
          </div>
          <div>
            <Label>Hero CTA 2 label</Label>
            <Input name="adminHeroCtaSecondaryLabel" defaultValue={(site as { adminHeroCtaSecondaryLabel?: string } | null)?.adminHeroCtaSecondaryLabel ?? "View Reports"} />
          </div>
          <div>
            <Label>Hero CTA 2 href</Label>
            <Input name="adminHeroCtaSecondaryHref" defaultValue={(site as { adminHeroCtaSecondaryHref?: string } | null)?.adminHeroCtaSecondaryHref ?? "/admin"} />
          </div>
          <div>
            <Label>Hero CTA 3 label</Label>
            <Input name="adminHeroCtaTertiaryLabel" defaultValue={(site as { adminHeroCtaTertiaryLabel?: string } | null)?.adminHeroCtaTertiaryLabel ?? "Manage Courses"} />
          </div>
          <div>
            <Label>Hero CTA 3 href</Label>
            <Input name="adminHeroCtaTertiaryHref" defaultValue={(site as { adminHeroCtaTertiaryHref?: string } | null)?.adminHeroCtaTertiaryHref ?? "/admin/content"} />
          </div>
          <Button type="submit" variant="outline">
            Save admin dashboard banners
          </Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Upload marketing image</h2>
        <p className="text-sm text-[var(--steel)]">
          Uploads go to <strong>Vercel Blob</strong> (when <code className="text-xs">BLOB_READ_WRITE_TOKEN</code> is
          set) and are served at <code className="text-xs">/api/cms-media/[key]</code> or the Blob CDN URL. Use
          key <code className="text-xs">hero_image</code> for the marketing homepage hero; candidate keys{" "}
          <code className="text-xs">dashboard_*</code>; or admin keys <code className="text-xs">admin_hero_bg</code>,{" "}
          <code className="text-xs">admin_hero_person</code>, <code className="text-xs">admin_promo</code> to replace
          dashboard banners instantly.
        </p>
        <form action={uploadMedia} className="flex flex-wrap items-end gap-3">
          <div>
            <Label>Key</Label>
            <Input name="key" placeholder="hero_image" required />
          </div>
          <div>
            <Label>Label</Label>
            <Input name="label" placeholder="Homepage hero" />
          </div>
          <div>
            <Label>Image</Label>
            <Input name="file" type="file" accept="image/*" required />
          </div>
          <Button type="submit" size="sm">
            Upload
          </Button>
        </form>
        {media.length > 0 && (
          <ul className="text-sm text-[var(--steel)]">
            {media.map((m) => (
              <li key={m.id}>
                <Link href={`/api/cms-media/${m.key}`} className="underline" target="_blank">
                  {m.key}
                </Link>{" "}
                — {m.label} ({Math.round(m.byteSize / 1024)}KB)
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Pages</h2>
        {pages.map((page) => (
          <Card key={page.id} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--amber)]">/{page.slug}</p>
            <form action={savePage} className="grid gap-3">
              <input type="hidden" name="id" value={page.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Title</Label>
                  <Input name="title" defaultValue={page.title} />
                </div>
                <div>
                  <Label>Hero badge</Label>
                  <Input name="heroBadge" defaultValue={page.heroBadge} />
                </div>
              </div>
              <div>
                <Label>Hero title</Label>
                <Input name="heroTitle" defaultValue={page.heroTitle} />
              </div>
              <div>
                <Label>Hero subtitle</Label>
                <textarea
                  name="heroSubtitle"
                  defaultValue={page.heroSubtitle}
                  className="mt-1 min-h-16 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <Label>Hero image URL</Label>
                <Input name="heroImageUrl" defaultValue={page.heroImageUrl} />
              </div>
              <div>
                <Label>Body (markdown-ish)</Label>
                <textarea
                  name="bodyMarkdown"
                  defaultValue={page.bodyMarkdown}
                  className="mt-1 min-h-32 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 font-mono text-xs"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Primary CTA label</Label>
                  <Input name="ctaPrimaryLabel" defaultValue={page.ctaPrimaryLabel} />
                </div>
                <div>
                  <Label>Primary CTA href</Label>
                  <Input name="ctaPrimaryHref" defaultValue={page.ctaPrimaryHref} />
                </div>
                <div>
                  <Label>Secondary CTA label</Label>
                  <Input name="ctaSecondaryLabel" defaultValue={page.ctaSecondaryLabel} />
                </div>
                <div>
                  <Label>Secondary CTA href</Label>
                  <Input name="ctaSecondaryHref" defaultValue={page.ctaSecondaryHref} />
                </div>
              </div>
              <div>
                <Label>Meta description</Label>
                <Input name="metaDescription" defaultValue={page.metaDescription} />
              </div>
              <Button type="submit" size="sm">
                Save {page.slug}
              </Button>
            </form>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Home sections</h2>
        {homeSections.map((section) => (
          <Card key={section.id} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--steel)]">{section.key}</p>
            <form action={saveSection} className="grid gap-3">
              <input type="hidden" name="id" value={section.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Eyebrow</Label>
                  <Input name="eyebrow" defaultValue={section.eyebrow} />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input name="imageUrl" defaultValue={section.imageUrl} />
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input name="title" defaultValue={section.title} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input name="subtitle" defaultValue={section.subtitle} />
              </div>
              <div>
                <Label>Body</Label>
                <textarea
                  name="body"
                  defaultValue={section.body}
                  className="mt-1 min-h-20 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>CTA label</Label>
                  <Input name="ctaLabel" defaultValue={section.ctaLabel} />
                </div>
                <div>
                  <Label>CTA href</Label>
                  <Input name="ctaHref" defaultValue={section.ctaHref} />
                </div>
              </div>
              {section.key === "hero" &&
                (() => {
                  const hero = parseHeroData(section.dataJson);
                  return (
                    <div className="space-y-3 rounded-xl border border-[var(--navy)]/10 bg-[var(--mist)]/40 p-3">
                      <p className="text-sm font-semibold text-[var(--navy)]">Hero extras</p>
                      <div>
                        <Label>Data eyebrow (optional override)</Label>
                        <Input name="hero_data_eyebrow" defaultValue={hero.eyebrow || ""} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Secondary CTA label</Label>
                          <Input name="hero_secondaryCtaLabel" defaultValue={hero.secondaryCtaLabel || ""} />
                        </div>
                        <div>
                          <Label>Secondary CTA href</Label>
                          <Input name="hero_secondaryCtaHref" defaultValue={hero.secondaryCtaHref || ""} />
                        </div>
                      </div>
                      <div>
                        <Label>Slide interval (ms)</Label>
                        <Input
                          name="hero_slideIntervalMs"
                          type="number"
                          min={2000}
                          step={500}
                          defaultValue={hero.slideIntervalMs || 6500}
                        />
                      </div>
                      <div>
                        <Label>Checklist (one item per line)</Label>
                        <textarea
                          name="hero_checks"
                          defaultValue={(hero.checks || []).join("\n")}
                          className="mt-1 min-h-16 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
                        />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--steel)]">Slideshow images</p>
                      {(hero.slides || []).map((slide, i) => (
                        <div key={i} className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <Label className="text-xs">Slide {i + 1} image URL</Label>
                            <Input name={`hero_slide_${i}_imageUrl`} defaultValue={slide.imageUrl} />
                          </div>
                          <div>
                            <Label className="text-xs">Slide {i + 1} alt text</Label>
                            <Input name={`hero_slide_${i}_alt`} defaultValue={slide.alt || ""} />
                          </div>
                        </div>
                      ))}
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--steel)]">Feature tiles</p>
                      {[0, 1, 2].map((i) => {
                        const tile = (hero.tiles || [])[i] || { title: "", body: "", icon: "laptop" };
                        return (
                          <div key={i} className="grid gap-2 rounded-lg border border-[var(--navy)]/8 bg-white p-2 sm:grid-cols-3">
                            <div>
                              <Label className="text-xs">Tile {i + 1} title</Label>
                              <Input name={`hero_tile_${i}_title`} defaultValue={tile.title} />
                            </div>
                            <div>
                              <Label className="text-xs">Body</Label>
                              <Input name={`hero_tile_${i}_body`} defaultValue={tile.body} />
                            </div>
                            <div>
                              <Label className="text-xs">Icon key</Label>
                              <Input name={`hero_tile_${i}_icon`} defaultValue={tile.icon} placeholder="laptop" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              {section.key === "trusted" &&
                (() => {
                  const trusted = parseTrustedData(section.dataJson);
                  return (
                    <div className="space-y-3 rounded-xl border border-[var(--navy)]/10 bg-[var(--mist)]/40 p-3">
                      <p className="text-sm font-semibold text-[var(--navy)]">Why Life Star pillars</p>
                      {(trusted.pillars || []).map((pillar, i) => (
                        <div key={i} className="grid gap-2 rounded-lg border border-[var(--navy)]/8 bg-white p-2 sm:grid-cols-3">
                          <div>
                            <Label className="text-xs">Pillar {i + 1} title</Label>
                            <Input name={`trusted_pillar_${i}_title`} defaultValue={pillar.title} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label className="text-xs">Body</Label>
                            <Input name={`trusted_pillar_${i}_body`} defaultValue={pillar.body} />
                          </div>
                          <div>
                            <Label className="text-xs">Icon key</Label>
                            <Input name={`trusted_pillar_${i}_icon`} defaultValue={pillar.icon} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              {section.key === "cta" &&
                (() => {
                  const cta = parseCtaData(section.dataJson);
                  return (
                    <div className="grid gap-3 rounded-xl border border-[var(--navy)]/10 bg-[var(--mist)]/40 p-3 sm:grid-cols-2">
                      <div>
                        <Label>Secondary CTA label</Label>
                        <Input name="cta_secondaryCtaLabel" defaultValue={cta.secondaryCtaLabel || ""} />
                      </div>
                      <div>
                        <Label>Secondary CTA href</Label>
                        <Input name="cta_secondaryCtaHref" defaultValue={cta.secondaryCtaHref || ""} />
                      </div>
                    </div>
                  );
                })()}
              <Button type="submit" size="sm" variant="outline">
                Save section
              </Button>
            </form>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Program cards</h2>
        {programs.map((p) => (
          <Card key={p.id}>
            <form action={saveProgram} className="grid gap-3">
              <input type="hidden" name="id" value={p.id} />
              <Input name="title" defaultValue={p.title} />
              <textarea
                name="blurb"
                defaultValue={p.blurb}
                className="min-h-16 rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
              />
              <Input name="imageUrl" defaultValue={p.imageUrl} />
              <Input name="href" defaultValue={p.href} />
              <Button type="submit" size="sm" variant="outline">
                Save program
              </Button>
            </form>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Stats</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((s) => (
            <Card key={s.id}>
              <form action={saveStat} className="grid gap-2">
                <input type="hidden" name="id" value={s.id} />
                <Input name="value" defaultValue={s.value} />
                <Input name="label" defaultValue={s.label} />
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
              </form>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">Testimonials</h2>
        {testimonials.map((t) => (
          <Card key={t.id}>
            <form action={saveTestimonial} className="grid gap-3">
              <input type="hidden" name="id" value={t.id} />
              <textarea
                name="quote"
                defaultValue={t.quote}
                className="min-h-20 rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <Input name="name" defaultValue={t.name} />
                <Input name="title" defaultValue={t.title} />
                <Input name="stars" type="number" min={1} max={5} defaultValue={t.stars} />
              </div>
              <Input name="photoUrl" defaultValue={t.photoUrl} />
              <Button type="submit" size="sm" variant="outline">
                Save testimonial
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
