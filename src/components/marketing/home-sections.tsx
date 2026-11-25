import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
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
  Headphones,
  Laptop,
  UserRound,
  Award,
  Trophy,
  GraduationCap,
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
  graduation: GraduationCap,
  license: Award,
  laptop: Laptop,
  person: UserRound,
  trophy: Trophy,
  award: Award,
};

type HeroData = {
  eyebrow?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  checks?: string[];
  tiles?: { title: string; body: string; icon: string }[];
  slides?: { imageUrl: string; alt?: string }[];
  slideIntervalMs?: number;
};

type TrustedData = {
  pillars?: { title: string; body: string; icon: string }[];
};

type CtaData = {
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { imageUrl: "/cms/hero-homepage-bg.jpg", alt: "Life Star instructor and student" },
  { imageUrl: "/cms/hero-homepage-photo.jpg", alt: "Life Star training vehicle" },
  { imageUrl: "/cms/hero-slide-1.jpg", alt: "Life Star instructor beside training vehicle" },
  { imageUrl: "/cms/hero-slide-2.jpg", alt: "Life Star academy instructors" },
  { imageUrl: "/cms/hero-slide-3.jpg", alt: "Life Star branded training car" },
];

const DEFAULT_CHECKS = [
  "Online Learning (Worldwide)",
  "Practical Training (Minnesota)",
  "License & Business Support",
];

const DEFAULT_TILES = [
  {
    title: "Learn Online",
    body: "Flexible, self-paced training accessible from anywhere in the world.",
    icon: "laptop",
  },
  {
    title: "Train In Minnesota",
    body: "Gain hands-on, real-world experience at our Minnesota campus.",
    icon: "person",
  },
  {
    title: "Get Licensed",
    body: "Meet state requirements with expert guidance and exam prep.",
    icon: "license",
  },
  {
    title: "Start Your Own School",
    body: "Get the tools, guidance, and business support to launch.",
    icon: "rocket",
  },
];

const DEFAULT_PILLARS = [
  {
    title: "Proven Expertise",
    body: "Years of experience in driver education and instructor training.",
    icon: "trophy",
  },
  {
    title: "Global Access",
    body: "Online training for students worldwide.",
    icon: "globe",
  },
  {
    title: "Experienced Instructors",
    body: "Learn from licensed, industry-leading professionals.",
    icon: "users",
  },
  {
    title: "Career & Business Support",
    body: "From licensing to launching your own driving school.",
    icon: "shield",
  },
];

export function HomeSections({
  sections,
  programs,
  stats,
  testimonials,
  mediaMap,
  header,
}: {
  sections: CmsSection[];
  programs: CmsProgramCard[];
  stats: CmsStat[];
  testimonials: CmsTestimonial[];
  mediaMap: Record<string, string>;
  header?: ReactNode;
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
  const heroSlides: HeroSlide[] = (heroData.slides?.length ? heroData.slides : DEFAULT_HERO_SLIDES)
    .map((s) => ({
      imageUrl: resolveCmsImage(s.imageUrl, mediaMap) || s.imageUrl,
      alt: s.alt,
    }))
    .filter((s, i, arr) => s.imageUrl && arr.findIndex((x) => x.imageUrl === s.imageUrl) === i);

  const trustedBg =
    resolveCmsImage(trusted?.imageUrl || "", mediaMap) ||
    trusted?.imageUrl ||
    "/cms/mock-trusted-bg.jpg";
  const ctaImage =
    resolveCmsImage(cta?.imageUrl || "", mediaMap) || cta?.imageUrl || "/cms/cta-journey-road.jpg";

  const checks = heroData.checks?.length ? heroData.checks : DEFAULT_CHECKS;
  const tiles = heroData.tiles?.length ? heroData.tiles : DEFAULT_TILES;
  const pillars = trustedData.pillars?.length ? trustedData.pillars : DEFAULT_PILLARS;
  const programCards = programs.slice(0, 3);

  return (
    <>
      {/* HERO — full-bleed photo + left gradient; CMS copy overlays */}
      {hero && (
        <section className="relative overflow-hidden text-white">
          {header}
          <HeroSlider
            slides={heroSlides}
            intervalMs={heroData.slideIntervalMs || 5500}
            fullBleed
          />
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(105deg, rgba(6,21,38,0.94) 0%, rgba(11,58,110,0.82) 38%, rgba(11,58,110,0.35) 62%, rgba(11,58,110,0.12) 100%)",
            }}
          />

          <div className="relative z-[2] mx-auto max-w-6xl px-5 pb-8 pt-28 lg:pb-10 lg:pt-32">
            <div className="max-w-xl animate-fade">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/95 backdrop-blur-sm">
                <Globe2 className="h-3.5 w-3.5 text-[var(--amber)]" />
                {heroData.eyebrow || hero.eyebrow || "International Instructor Training Platform"}
              </span>
              <h1 className="mt-5 font-[family-name:var(--font-marketing)] text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.65rem]">
                {renderHeroTitle(
                  hero.title || "Become a Certified Driving Instructor with Life Star",
                )}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
                {hero.subtitle ||
                  "A world-class academy that prepares you to become a licensed driving instructor, build a rewarding career, or launch your own school — anywhere in the world."}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={hero.ctaHref || "/signup"}
                  className="rounded-md bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[var(--navy-deep)] shadow-[0_10px_30px_rgba(230,168,23,0.35)] transition hover:bg-[var(--amber-hot)]"
                >
                  {hero.ctaLabel || "Apply Now"} →
                </Link>
                <Link
                  href={heroData.secondaryCtaHref || "/programs"}
                  className="inline-flex items-center gap-2 rounded-md border border-white/80 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {heroData.secondaryCtaLabel || "Explore Programs"}
                  <Play className="h-3.5 w-3.5 fill-current" />
                </Link>
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                {checks.map((item) => (
                  <li key={item} className="inline-flex items-center gap-2 text-xs font-semibold text-white sm:text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--navy-deep)]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature tiles — glass bar */}
            <div className="mt-10 grid gap-3 rounded-xl border border-white/15 bg-[rgba(8,28,58,0.55)] p-3 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4 lg:p-4">
              {tiles.map((tile) => {
                const Icon = tileIcons[tile.icon] || Globe2;
                return (
                  <div key={tile.title} className="flex gap-3 rounded-lg px-2 py-2 sm:px-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--amber)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{tile.title}</p>
                      <p className="mt-0.5 text-xs leading-snug text-white/70">{tile.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* PROGRAMS — 3 cards */}
      {programsSec && (
        <section className="bg-white px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="h-0.5 w-8 bg-[var(--amber)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--navy)]">
                  {programsSec.eyebrow || "OUR PROGRAMS"}
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-marketing)] text-3xl font-bold text-[var(--navy)] sm:text-4xl">
                {programsSec.title || "Comprehensive Instructor Training Programs"}
              </h2>
              <p className="mt-3 text-[var(--steel)]">
                {programsSec.subtitle ||
                  "Flexible pathways to certification, licensing, and launching your own driving school."}
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {programCards.map((card) => {
                const Icon = tileIcons[card.iconKey] || GraduationCap;
                const img = resolveCmsImage(card.imageUrl, mediaMap) || card.imageUrl;
                return (
                  <article
                    key={card.id}
                    className="overflow-hidden rounded-xl bg-white shadow-[0_12px_40px_rgba(11,31,51,0.08)] ring-1 ring-[var(--navy)]/8"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--mist)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="relative px-5 pb-6 pt-8">
                      <span className="absolute -top-5 left-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#2b6cb0] text-white shadow-md ring-4 ring-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="font-[family-name:var(--font-marketing)] text-lg font-bold text-[var(--navy)]">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--steel)]">{card.blurb}</p>
                      <Link
                        href={card.href}
                        className="mt-4 inline-flex text-sm font-bold text-[var(--amber)] hover:underline"
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

      {/* WHY LIFE STAR */}
      {trusted && (
        <section className="relative overflow-hidden px-5 py-16 text-white sm:py-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={trustedBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[rgba(6,21,38,0.88)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-0.5 w-8 bg-[var(--amber)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--amber)]">
                  {trusted.eyebrow || "WHY LIFE STAR"}
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-marketing)] text-3xl font-bold leading-tight sm:text-4xl">
                {trusted.title || "A Trusted Global Leader in Instructor Training"}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                {trusted.body ||
                  "We combine expert instruction, real-world experience, and business guidance to help you build a long-term, impactful career in driver education."}
              </p>
              <Link
                href={trusted.ctaHref || "/signup"}
                className="mt-7 inline-flex rounded-md bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[var(--navy-deep)] transition hover:bg-[var(--amber-hot)]"
              >
                {trusted.ctaLabel || "Apply Today"} →
              </Link>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl bg-white/15 sm:grid-cols-2">
              {pillars.map((p) => {
                const Icon = tileIcons[p.icon] || Trophy;
                return (
                  <div key={p.title} className="bg-[rgba(8,28,58,0.55)] p-5 backdrop-blur-sm">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--amber)]/40 text-[var(--amber)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-3 text-base font-bold">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">{p.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {stats.length > 0 && (
        <section className="border-y border-[var(--navy)]/8 bg-[#f4f7fb] px-5 py-10">
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => {
              const Icon = tileIcons[stat.iconKey] || Users;
              return (
                <div
                  key={stat.id}
                  className={`flex items-center gap-3 ${idx > 0 ? "lg:border-l lg:border-[var(--navy)]/10 lg:pl-6" : ""}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2b6cb0] shadow-sm ring-1 ring-[#2b6cb0]/10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-[family-name:var(--font-marketing)] text-2xl font-bold leading-tight text-[var(--navy)]">
                      {stat.value}
                    </p>
                    <p className="text-xs text-[var(--steel)] sm:text-sm">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonialsSec && (
        <section id="testimonials" className="bg-white px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="h-0.5 w-8 bg-[var(--amber)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--navy)]">
                  {testimonialsSec.eyebrow || "WHAT OUR GRADUATES SAY"}
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-marketing)] text-3xl font-bold text-[var(--navy)] sm:text-4xl">
                {testimonialsSec.title || "Success Stories from Around the World"}
              </h2>
              {testimonialsSec.subtitle ? (
                <p className="mt-3 text-[var(--steel)]">{testimonialsSec.subtitle}</p>
              ) : null}
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {testimonials.map((t) => {
                const photo = resolveCmsImage(t.photoUrl, mediaMap) || t.photoUrl;
                return (
                  <article
                    key={t.id}
                    className="rounded-xl bg-white p-5 shadow-[0_12px_40px_rgba(11,31,51,0.08)] ring-1 ring-[var(--navy)]/8"
                  >
                    <div className="flex gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-full object-cover object-center ring-2 ring-[var(--amber)]/30"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex gap-0.5 text-[var(--amber)]">
                          {Array.from({ length: t.stars }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="mt-2 text-sm italic leading-relaxed text-[var(--navy)]">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                        <p className="mt-3 text-sm font-bold text-[var(--navy)]">— {t.name}</p>
                        <p className="text-xs text-[var(--steel)]">{t.title}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-8 flex justify-center gap-2" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--navy)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--navy)]/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--navy)]/25" />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {cta && (
        <section className="px-5 pb-16 sm:pb-20">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl shadow-[0_18px_50px_rgba(11,31,51,0.16)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ctaImage} alt="" className="absolute inset-0 h-full w-full object-cover object-left" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(6,21,38,0.25) 0%, rgba(11,58,110,0.55) 45%, rgba(11,58,110,0.92) 72%)",
              }}
            />
            <div className="relative flex min-h-[220px] items-center justify-end px-6 py-10 sm:px-10">
              <div className="max-w-md text-white sm:text-right">
                <h2 className="font-[family-name:var(--font-marketing)] text-2xl font-bold sm:text-3xl">
                  {cta.title || "Ready to Start Your Journey?"}
                </h2>
                <p className="mt-2 text-sm text-white/85 sm:text-base">
                  {cta.subtitle ||
                    "Apply now to join Life Star Instructors Academy and take the first step toward a rewarding, high-impact career."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3 sm:justify-end">
                  <Link
                    href={cta.ctaHref || "/signup"}
                    className="rounded-md bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[var(--navy-deep)] transition hover:bg-[var(--amber-hot)]"
                  >
                    {cta.ctaLabel || "Apply Now"} →
                  </Link>
                  <Link
                    href={ctaData.secondaryCtaHref || "/admissions"}
                    className="inline-flex items-center gap-2 rounded-md border border-white/80 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Headphones className="h-4 w-4" />
                    {ctaData.secondaryCtaLabel || "Speak with an Advisor"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function renderHeroTitle(title: string) {
  const parts = title.split(/(Life Star)/i);
  return parts.map((part, i) => {
    if (/^Life Star$/i.test(part)) {
      return (
        <span key={i} className="text-[var(--amber)]">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
