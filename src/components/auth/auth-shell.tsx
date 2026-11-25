import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export type AuthBullet = { title: string; body?: string };

export function AuthShell({
  headline,
  subheadline,
  bullets,
  imageSrc,
  children,
  stepper,
}: {
  headline: string;
  subheadline?: string;
  bullets: AuthBullet[];
  imageSrc: string;
  children: ReactNode;
  stepper?: { steps: string[]; activeIndex: number };
}) {
  return (
    <main className="min-h-screen bg-[#e8eef5] font-[family-name:var(--font-marketing)]">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <aside className="relative overflow-hidden bg-[var(--navy-deep)] px-8 py-10 text-white lg:px-12 lg:py-14">
          {/* Full-bleed mock photo — object-top so faces/cars aren't center-cropped away */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy-deep)] via-[var(--navy-deep)]/92 to-[var(--navy-deep)]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)] via-transparent to-[var(--navy-deep)]/40" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-2/3 rounded-tr-full bg-gradient-to-r from-[var(--amber)] to-transparent opacity-90" />

          <div className="relative z-10 flex h-full min-h-[520px] flex-col">
            <BrandLogo markClassName="h-10 w-auto" />

            <h1 className="mt-10 max-w-md text-3xl font-bold leading-tight sm:text-4xl">{headline}</h1>
            {subheadline && <p className="mt-3 max-w-md text-sm text-white/80">{subheadline}</p>}

            {stepper ? (
              <ol className="mt-10 space-y-4">
                {stepper.steps.map((step, i) => {
                  const active = i === stepper.activeIndex;
                  const done = i < stepper.activeIndex;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          active
                            ? "bg-[var(--amber)] text-[var(--navy-deep)]"
                            : done
                              ? "bg-white/20 text-white"
                              : "bg-white/10 text-white/50"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className={`text-sm font-semibold ${active ? "text-[var(--amber)]" : "text-white/80"}`}>
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : bullets.length > 0 ? (
              <ul className="mt-8 space-y-4">
                {bullets.map((b) => (
                  <li key={b.title} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--amber)]" />
                    <div>
                      <p className="text-sm font-semibold">{b.title}</p>
                      {b.body && <p className="mt-0.5 text-xs text-white/65">{b.body}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-auto pt-10 text-xs text-white/50">
              <Link href="/" className="hover:text-white/80">
                ← Back to homepage
              </Link>
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(11,31,51,0.12)] ring-1 ring-[var(--navy)]/8 sm:p-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
