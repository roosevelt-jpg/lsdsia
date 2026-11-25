"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlide = {
  imageUrl: string;
  alt?: string;
};

export function HeroSlider({
  slides,
  intervalMs = 5500,
  className = "",
}: {
  slides: HeroSlide[];
  intervalMs?: number;
  className?: string;
}) {
  const items = slides.filter((s) => Boolean(s.imageUrl));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, intervalMs, paused]);

  if (items.length === 0) return null;

  const go = (next: number) => {
    setIndex((next + items.length) % items.length);
  };

  return (
    <div
      className={`absolute inset-y-0 right-0 w-[58%] ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero image slideshow"
    >
      {items.map((slide, i) => (
        <div
          key={`${slide.imageUrl}-${i}`}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
          role="img"
          aria-label={slide.alt || `Slide ${i + 1}`}
          aria-hidden={i !== index}
        />
      ))}

      {items.length > 1 && (
        <>
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Previous slide"
              className="rounded-full p-1 text-white/80 hover:bg-white/15 hover:text-white"
              onClick={() => go(index - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-5 bg-[var(--amber)]" : "w-2 bg-white/55 hover:bg-white/80"
                  }`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next slide"
              className="rounded-full p-1 text-white/80 hover:bg-white/15 hover:text-white"
              onClick={() => go(index + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="sr-only" aria-live="polite">
            Slide {index + 1} of {items.length}
          </p>
        </>
      )}
    </div>
  );
}
