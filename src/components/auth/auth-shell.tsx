import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

export type AuthBullet = { title: string; body?: string };

export function AuthShell({
  headline,
  bullets,
  imageSrc,
  children,
  stepper,
}: {
  headline: string;
  bullets: AuthBullet[];
  imageSrc: string;
  children: ReactNode;
  stepper?: { steps: string[]; activeIndex: number };
}) {
  return (
    <main className="min-h-screen bg-[var(--mist)] font-[family-name:var(--font-marketing)]">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <aside className="relative overflow-hidden bg-[var(--navy-deep)] px-8 py-10 text-white lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(230,168,23,0.2),transparent_50%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--navy-deep)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M12 2.5l2.4 7.2h7.6l-6.2 4.5 2.4 7.3L12 17l-6.2 4.5 2.4-7.3L2 9.7h7.6L12 2.5z" />
                </svg>
              </span>
              <span className="text-[11px] font-bold uppercase leading-tight tracking-[0.12em]">
                Life Star Instructors Academy
              </span>
            </Link>

            <h1 className="mt-10 max-w-md text-3xl font-bold leading-tight sm:text-4xl">{headline}</h1>

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

            <div className="relative mt-auto pt-10">
              <div className="overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc} alt="" className="h-48 w-full object-cover sm:h-56" />
              </div>
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
