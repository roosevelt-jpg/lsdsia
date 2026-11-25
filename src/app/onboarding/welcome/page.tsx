import Link from "next/link";
import { ArrowRight, BookOpen, LineChart, Award, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";

const tiles = [
  {
    title: "Access Your Courses",
    body: "Start online lessons anytime.",
    href: "/app/learn",
    icon: BookOpen,
  },
  {
    title: "Track Your Progress",
    body: "See enrollments, quizzes, and next actions.",
    href: "/app",
    icon: LineChart,
  },
  {
    title: "Prepare for Certification",
    body: "Practice exams and application packet.",
    href: "/app/quiz",
    icon: Award,
  },
  {
    title: "Get Ongoing Support",
    body: "Resources and school-launch coaching.",
    href: "/app/resources",
    icon: Users,
  },
];

export default async function WelcomeOnboardingPage() {
  const session = await requireUser();

  return (
    <main className="relative min-h-screen overflow-hidden font-[family-name:var(--font-marketing)] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(160deg, rgba(6,21,38,0.92), rgba(11,31,51,0.82)), url(/cms/auth-welcome.jpg)",
        }}
      />
      {/* confetti-ish accents */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_20%_30%,rgba(230,168,23,0.45),transparent_25%),radial-gradient(circle_at_70%_20%,rgba(56,189,248,0.35),transparent_20%),radial-gradient(circle_at_85%_40%,rgba(230,168,23,0.3),transparent_18%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_0_10px_rgba(16,185,129,0.25)]">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-8 text-4xl font-bold sm:text-5xl">You&apos;re All Set!</h1>
        <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
          Your account has been created, {session.name.split(" ")[0]}. Welcome to Life Star Instructors Academy —
          students worldwide, practicals in Minnesota.
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className="rounded-xl bg-[var(--navy)]/70 p-5 text-left ring-1 ring-white/15 backdrop-blur transition hover:bg-[var(--navy)]/85"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--amber)]/20 text-[var(--amber)]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold">{tile.title}</p>
                <p className="mt-1 text-xs text-white/70">{tile.body}</p>
              </Link>
            );
          })}
        </div>

        <Link
          href="/app"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[var(--amber)] px-8 py-3.5 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
        >
          Go to My Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
