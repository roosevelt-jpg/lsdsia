import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main>
      <section className="hero-plane relative min-h-[100svh] text-white">
        <SiteHeader />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:justify-center sm:pb-24">
          <p className="animate-fade font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
            Life Star Driving School
          </p>
          <h1 className="animate-rise mt-5 max-w-2xl text-xl font-medium text-white/95 sm:text-2xl md:text-3xl">
            Train to become a licensed commercial driving instructor — then earn your practicals in Minnesota.
          </h1>
          <p className="animate-rise-delay mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Study online with Life Star, then travel to our Minnesota main campus for laboratory training under
            Minnesota Rules Part 7411.0630.
          </p>
          <div className="animate-rise-delay mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Start learning</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/pricing">View levels & pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[var(--mist)] px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl text-[var(--navy)] sm:text-4xl">Online study. Minnesota campus practicals.</h2>
          <p className="mt-4 text-lg text-[var(--steel)]">
            Life Star’s Instructor Academy coaches candidates through licensing knowledge, practice exams modeled on
            the instructor Q&A set, a digital preparation packet for PS36008-10, and scheduled intensives at the
            Minnesota campus — not a generic LMS template.
          </p>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href="/app">Open candidate dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
