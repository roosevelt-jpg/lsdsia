import Link from "next/link";
import type { ComponentType } from "react";
import {
  Check,
  Globe2,
  MapPin,
  BadgeCheck,
  Building2,
  Shield,
  Rocket,
  Users,
  Star,
  Play,
  Phone,
} from "lucide-react";
import type { CmsProgramCard, CmsSection, CmsStat, CmsTestimonial } from "@prisma/client";
import { parseJsonObject, resolveCmsImage } from "@/lib/cms";
import { HeroSlider, type HeroSlide } from "@/components/marketing/hero-slider";

const tileIcons: Record<string, ComponentType<{ className?: string }>> = {
  globe: Globe2,
  map: MapPin,
  badge: BadgeCheck,
  building: Building2,
  shield: Shield,
  rocket: Rocket,
  users: Users,
  graduation: BadgeCheck,
  license: BadgeCheck,
};

type HeroData = {
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  tiles?: { title: string; body: string; icon: string }[];
  /** Hero right-side slideshow images (admin-editable via section dataJson). */
  slides?: { imageUrl: string; alt?: string }[];
  slideIntervalMs?: number;
};

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { imageUrl: "/cms/mock-hero-instructor.jpg", alt: "Life Star instructor beside training vehicle" },
  { imageUrl: "/cms/mock-auth-instructors.jpg", alt: "Life Star academy instructors" },
  { imageUrl: "/cms/mock-auth-car.jpg", alt: "Life Star branded training car" },
  { imageUrl: "/cms/mock-campus-building.jpg", alt: "Life Star Instructors Academy campus" },
  { imageUrl: "/cms/dashboard/hero-person.jpg", alt: "Instructor with Life Star training vehicle" },
  { imageUrl: "/cms/admin/hero-person-hires.jpg", alt: "Campus instructor in safety vest" },
];

type TrustedData = {
  checklist?: string[];
  campusCard?: {
    title: string;
    location: string;
    body: string;
    items: string[];
    ctaLabel: string;
    ctaHref: string;
  };
};

type CtaData = {
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

export function HomeSections({
  sections,
  programs,
  stats,
  testimonials,
  mediaMap,
}: {
  sections: CmsSection[];
  programs: CmsProgramCard[];
  stats: CmsStat[];
  testimonials: CmsTestimonial[];
  mediaMap: Record<string, string>;
}) {
  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));
  const hero = byKey.hero;
  const programsSec = byKey.programs;
  const trusted = byKey.trusted;
  const testimonialsSec = byKey.testimonials;
  const cta = byKey.cta;

  const heroData = parseJsonObject<HeroData>(hero?.dataJson || "{}", {});
  const trustedData = parseJsonObject<TrustedData>(trusted?.dataJson || "{}", {});
  const ctaData = parseJsonObject<CtaData>(cta?.dataJson || "{}", {});
  const heroFallback =
    resolveCmsImage(hero?.imageUrl || "", mediaMap) || "/cms/mock-hero-instructor.jpg";
  const heroSlides: HeroSlide[] = (
    heroData.slides?.length
      ? heroData.slides
      : [{ imageUrl: heroFallback, alt: "Life Star Instructors Academy" }, ...DEFAULT_HERO_SLIDES.slice(1)]
  )
    .map((s) => ({
      imageUrl: resolveCmsImage(s.imageUrl, mediaMap) || s.imageUrl,
      alt: s.alt,
    }))
    .filter((s, i, arr) => s.imageUrl && arr.findIndex((x) => x.imageUrl === s.imageUrl) === i);
  const campusImage =
    resolveCmsImage(trusted?.imageUrl || "", mediaMap) || "/cms/mock-campus-building.jpg";
  const ctaImage =
    resolveCmsImage(cta?.imageUrl || "", mediaMap) || cta?.imageUrl || "/cms/mock-cta-car.jpg";

  return (
    <>
      {/* HERO — curved navy + gold swoosh + image slideshow */}
      {hero && (
        <section className="relative overflow-hidden text-white">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, #061526 0%, #0B3A6E 48%, #1256A0 78%, transparent 78%), linear-gradient(90deg, #061526 0%, #061526 42%, transparent 70%)",
            }}
          />
          <HeroSlider slides={heroSlides} intervalMs={heroData.slideIntervalMs || 5500} />
          <div
            className="pointer-events-none absolute inset-y-0 right-[40%] z-[1] w-[22%] bg-gradient-to-r from-[#0B3A6E] via-[#0B3A6E]/70 to-transparent"
            aria-hidden
          />
          <svg
            className="pointer-events-none absolute inset-y-0 right-[38%] z-[1] h-full w-[18%] text-[var(--amber)]"
            viewBox="0 0 120 800"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M80 0 C 40 200, 20 400, 70 800" fill="none" stroke="currentColor" strokeWidth="6" />
          </svg>

          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-6 pt-12 lg:grid-cols-2 lg:items-center lg:pt-16">
            <div className="animate-fade">
              <h1 className="font-[family-name:var(--font-marketing)] text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
                {renderHeroTitle(hero.title || "Learn globally. Train professionally. Lead confidently.")}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                {hero.subtitle}
              </p>

              <div className="mt-7 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                {(heroData.tiles || []).map((tile) => {
                  const Icon = tileIcons[tile.icon] || Globe2;
                  return (
                    <div key={tile.title} className="flex items-center gap-2.5 text-sm text-white/95">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--amber)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-semibold leading-snug">{tile.title}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={hero.ctaHref || "/signup"}
                  className="rounded-full bg-[var(--amber)] px-6 py-2.5 text-sm font-bold text-[var(--navy-deep)] shadow-[0_10px_30px_rgba(230,168,23,0.35)] hover:bg-[var(--amber-hot)]"
                >
                  {hero.ctaLabel || "Apply for Training"} →
                </Link>
                <Link
                  href={heroData.secondaryCtaHref || "/about"}
                  className="inline-flex items-center gap-2 rounded-full border border-white/80 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <Play className="h-4 w-4" />
                  {heroData.secondaryCtaLabel || "Watch Academy Overview"}
                </Link>
              </div>
            </div>
            <div className="hidden lg:block" aria-hidden />
          </div>

          {/* Stats bar under hero */}
          {stats.length > 0 && (
            <div className="relative border-t border-white/10 bg-white text-[var(--navy)]">
              <div className="mx-auto grid max-w-6xl gap-6 px-5 py-7 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => {
                  const Icon = tileIcons[stat.iconKey] || Users;
                  return (
                    <div
                      key={stat.id}
                      className={`flex items-center gap-3 ${idx > 0 ? "lg:border-l lg:border-[var(--navy)]/10 lg:pl-6" : ""}`}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mist)] text-[var(--navy)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-[family-name:var(--font-marketing)] text-lg font-bold leading-tight">
                          {stat.value}
                        </p>
                        <p className="text-xs text-[var(--steel)] sm:text-sm">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* PROGRAMS — 4 cards */}
      {programsSec && (
        <section className="bg-[#f5f7fa] px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex rounded-full bg-[var(--amber)]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--navy)]">
                {programsSec.eyebrow || "OUR PROGRAMS"}
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-marketing)] text-3xl font-bold text-[var(--navy)] sm:text-4xl">
                {programsSec.title}
              </h2>
              <p className="mt-3 text-[var(--steel)]">{programsSec.subtitle}</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {programs.map((card) => {
                const Icon = tileIcons[card.iconKey] || BadgeCheck;
                const img = resolveCmsImage(card.imageUrl, mediaMap) || card.imageUrl;
                return (
                  <article
                    key={card.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(11,31,51,0.08)] ring-1 ring-[var(--navy)]/6"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[var(--mist)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="relative px-4 pb-5 pt-6">
                      <span className="absolute -top-5 left-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--navy)] text-white shadow-md">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="font-[family-name:var(--font-marketing)] text-base font-bold text-[var(--navy)]">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--steel)]">{card.blurb}</p>
                      <Link
                        href={card.href}
                        className="mt-4 inline-flex text-sm font-bold text-[#1d4ed8] hover:underline"
                      >
                        Learn More →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* WHY LIFE STAR + campus */}
      {trusted && (
        <section className="bg-white px-5 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.1fr_0.9fr] lg:items-start">
            <div>
              <span className="inline-flex rounded-full bg-[var(--amber)]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--navy)]">
                {trusted.eyebrow || "WHY LIFE STAR"}
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-marketing)] text-3xl font-bold leading-tight text-[var(--navy)]">
                {trusted.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--steel)] sm:text-base">{trusted.body}</p>
              <ul className="mt-6 space-y-3">
                {(trustedData.checklist || []).map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--navy)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] shadow-[0_18px_50px_rgba(11,31,51,0.12)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={campusImage}
                alt="Life Star Instructors Academy campus"
                className="h-full min-h-[280px] w-full object-cover object-center"
              />
            </div>

            {trustedData.campusCard && (
              <div className="rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(11,31,51,0.12)] ring-1 ring-[var(--navy)]/8">
                <h3 className="font-[family-name:var(--font-marketing)] text-xl font-bold text-[var(--navy)]">
                  {trustedData.campusCard.title}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--amber)]">
                  <MapPin className="h-4 w-4" />
                  {trustedData.campusCard.location}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--steel)]">
                  {trustedData.campusCard.body}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {trustedData.campusCard.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[var(--navy)]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={trustedData.campusCard.ctaHref || trusted.ctaHref || "/about"}
                  className="mt-6 inline-flex rounded-full bg-gradient-to-r from-[var(--amber)] to-[#f0b92a] px-5 py-2.5 text-sm font-bold text-[var(--navy-deep)]"
                >
                  {trustedData.campusCard.ctaLabel || trusted.ctaLabel || "Explore Campus"} →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonialsSec && (
        <section className="bg-[#f5f7fa] px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex rounded-full bg-[var(--amber)]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--navy)]">
                {testimonialsSec.eyebrow || "WHAT OUR GRADUATES SAY"}
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-marketing)] text-3xl font-bold text-[var(--navy)] sm:text-4xl">
                {testimonialsSec.title}
              </h2>
              <p className="mt-3 text-[var(--steel)]">{testimonialsSec.subtitle}</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => {
                const photo = resolveCmsImage(t.photoUrl, mediaMap) || t.photoUrl;
                return (
                  <article
                    key={t.id}
                    className="rounded-2xl bg-white p-6 shadow-[0_12px_40px_rgba(11,31,51,0.08)] ring-1 ring-[var(--navy)]/6"
                  >
                    <div className="flex gap-0.5 text-[var(--amber)]">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm italic leading-relaxed text-[var(--steel)]">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover object-center ring-2 ring-[var(--amber)]/40"
                      />
                      <div>
                        <p className="text-sm font-bold text-[var(--navy)]">{t.name}</p>
                        <p className="text-xs text-[var(--steel)]">{t.title}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {cta && (
        <section className="px-5 pb-16 pt-4 sm:pb-20">
          <div
            className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-[1.75rem] px-6 py-10 text-white sm:flex-row sm:px-10"
            style={{
              background: "linear-gradient(115deg,#0B3A6E 0%,#1256A0 100%)",
            }}
          >
            <div className="w-full shrink-0 sm:w-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ctaImage}
                alt=""
                className="mx-auto h-36 w-full max-w-xs object-contain object-center drop-shadow-xl sm:h-40"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-[family-name:var(--font-marketing)] text-2xl font-bold sm:text-3xl">
                {cta.title}
              </h2>
              <p className="mt-2 text-sm text-white/85 sm:text-base">{cta.subtitle}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-end">
              <Link
                href={cta.ctaHref || "/signup"}
                className="rounded-full bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
              >
                {cta.ctaLabel || "Apply Now"} →
              </Link>
              <Link
                href={ctaData.secondaryCtaHref || "/admissions"}
                className="inline-flex items-center gap-2 rounded-full border border-white/80 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                {ctaData.secondaryCtaLabel || "Talk to an Advisor"}
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function renderHeroTitle(title: string) {
  // Gold accent on final sentence like the mock: "Lead confidently."
  const parts = title.split(/(Lead confidently\.?)/i);
  return parts.map((part, i) => {
    if (/^Lead confidently\.?$/i.test(part)) {
      return (
        <span key={i} className="text-[var(--amber)]">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
