import Link from "next/link";
import type { ComponentType } from "react";
import { Check, Globe2, MapPin, BadgeCheck, Building2, Shield, Rocket, Users, Star } from "lucide-react";
import type { CmsProgramCard, CmsSection, CmsStat, CmsTestimonial } from "@prisma/client";
import { parseJsonObject, resolveCmsImage } from "@/lib/cms";

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
  badge?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  checklist?: string[];
  tiles?: { title: string; body: string; icon: string }[];
};

type TrustedData = {
  features?: { title: string; body: string; icon: string }[];
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
  const heroImage = resolveCmsImage(hero?.imageUrl || "", mediaMap) || "/cms/hero-instructor.jpg";

  return (
    <>
      {/* HERO */}
      {hero && (
        <section className="relative overflow-hidden bg-[var(--navy-deep)] text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(230,168,23,0.16),transparent_50%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-8 pt-12 lg:grid-cols-2 lg:items-center lg:pt-16">
            <div className="animate-fade">
              {(heroData.badge || hero.eyebrow) && (
                <span className="inline-flex rounded-full bg-[#1a3a5c] px-3 py-1 text-xs font-semibold text-sky-100 ring-1 ring-sky-400/30">
                  {heroData.badge || hero.eyebrow}
                </span>
              )}
              <h1 className="mt-5 font-[family-name:var(--font-marketing)] text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {renderTitleWithGold(hero.title || "Become a Certified Driving Instructor with Life Star")}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{hero.subtitle}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={hero.ctaHref || "/signup"}
                  className="rounded-md bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
                >
                  {hero.ctaLabel || "Apply Now"}
                </Link>
                <Link
                  href={heroData.secondaryCtaHref || "/programs"}
                  className="rounded-md border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  {heroData.secondaryCtaLabel || "Explore Programs"}
                </Link>
              </div>
              <ul className="mt-6 space-y-2">
                {(heroData.checklist || []).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-3.5 w-3.5 text-[var(--amber)]" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative animate-rise">
              <div className="overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="" className="h-full max-h-[420px] w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/10 bg-[#12324f]/90 backdrop-blur">
            <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
              {(heroData.tiles || []).map((tile) => {
                const Icon = tileIcons[tile.icon] || Globe2;
                return (
                  <div key={tile.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--amber)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-[family-name:var(--font-marketing)] text-sm font-bold">{tile.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/70">{tile.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* PROGRAMS */}
      {programsSec && (
        <section className="bg-white px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--amber)]">
                {programsSec.eyebrow || "OUR PROGRAMS"}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-marketing)] text-3xl font-bold text-[var(--navy)] sm:text-4xl">
                {programsSec.title}
              </h2>
              <p className="mt-3 text-[var(--steel)]">{programsSec.subtitle}</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {programs.map((card) => {
                const Icon = tileIcons[card.iconKey] || BadgeCheck;
                const img = resolveCmsImage(card.imageUrl, mediaMap) || card.imageUrl;
                return (
                  <article
                    key={card.id}
                    className="overflow-hidden rounded-xl bg-white shadow-[0_12px_40px_rgba(11,31,51,0.08)] ring-1 ring-[var(--navy)]/8"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[var(--mist)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-5">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--navy)] text-[var(--amber)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="mt-3 font-[family-name:var(--font-marketing)] text-lg font-bold text-[var(--navy)]">
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

      {/* TRUSTED */}
      {trusted && (
        <section className="bg-[var(--navy)] px-5 py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-[family-name:var(--font-marketing)] text-3xl font-bold leading-tight sm:text-4xl">
                {trusted.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/75">{trusted.body}</p>
              <Link
                href={trusted.ctaHref || "/signup"}
                className="mt-7 inline-flex rounded-md bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
              >
                {trusted.ctaLabel || "Apply Today"} →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(trustedData.features || []).map((f) => {
                const Icon = tileIcons[f.icon] || Shield;
                return (
                  <div key={f.title} className="rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--amber)]/15 text-[var(--amber)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-3 font-[family-name:var(--font-marketing)] text-base font-bold">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-white/70">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {stats.length > 0 && (
        <section className="border-y border-[var(--navy)]/8 bg-[#eef3f8] px-5 py-10">
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = tileIcons[stat.iconKey] || Users;
              return (
                <div key={stat.id} className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--navy)] text-[var(--amber)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-[family-name:var(--font-marketing)] text-2xl font-bold text-[var(--navy)]">
                      {stat.value}
                    </p>
                    <p className="text-sm text-[var(--steel)]">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonialsSec && (
        <section className="bg-white px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--amber)]">
                {testimonialsSec.eyebrow || "WHAT OUR GRADUATES SAY"}
              </p>
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
                    className="rounded-xl bg-white p-6 shadow-[0_12px_40px_rgba(11,31,51,0.08)] ring-1 ring-[var(--navy)]/8"
                  >
                    <div className="flex gap-0.5 text-[var(--amber)]">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-[var(--steel)]">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-5 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-[var(--amber)]/40" />
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
        <section className="relative overflow-hidden px-5 py-20 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(115deg, rgba(6,21,38,0.88), rgba(11,31,51,0.72)), url(${resolveCmsImage(cta.imageUrl, mediaMap) || cta.imageUrl || "/cms/cta-road.jpg"})`,
            }}
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="font-[family-name:var(--font-marketing)] text-3xl font-bold sm:text-4xl">{cta.title}</h2>
            <p className="mt-4 text-base text-white/85 sm:text-lg">{cta.subtitle}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={cta.ctaHref || "/signup"}
                className="rounded-md bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
              >
                {cta.ctaLabel || "Apply Now"}
              </Link>
              <Link
                href={ctaData.secondaryCtaHref || "/admissions"}
                className="rounded-md border border-white/80 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {ctaData.secondaryCtaLabel || "Speak with an Advisor"}
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function renderTitleWithGold(title: string) {
  // Emphasize "Life Star" and "Certified Driving Instructor" like the mock
  const parts = title.split(/(Certified Driving Instructor|Life Star)/g);
  return parts.map((part, i) => {
    if (part === "Life Star") {
      return (
        <span key={i} className="text-[var(--amber)]">
          {part}
        </span>
      );
    }
    if (part === "Certified Driving Instructor") {
      return (
        <span key={i} className="underline decoration-[var(--amber)] decoration-4 underline-offset-4">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
