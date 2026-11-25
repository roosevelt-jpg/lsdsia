"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";

export type QaSlide = {
  id: string;
  number: number;
  prompt: string;
  type: string;
  topic: string;
  choices: string[] | null;
  correctIndex: number | null;
  acceptedKeywords: string[] | null;
  explanation: string;
};

export function QaSlides({ slides, quizTitle }: { slides: QaSlide[]; quizTitle: string }) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const total = slides.length;
  const slide = slides[index] || null;

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => {
        const next = i + dir;
        if (next < 0 || next >= total) return i;
        return next;
      });
    },
    [total],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "a" || e.key === "A") {
        setShowAnswer((v) => !v);
      } else if (e.key === "f" || e.key === "F") {
        setFullscreen((v) => !v);
      } else if (e.key === "Escape") {
        setFullscreen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!total || !slide) {
    return (
      <div className="rounded-xl bg-white p-8 text-sm text-[var(--steel)] ring-1 ring-[var(--navy)]/10">
        No questions are marked for the admin slideshow yet. Toggle “In slides” on the Quizzes page.
      </div>
    );
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const correctLabel =
    slide.type === "multiple_choice" && slide.correctIndex != null && slide.choices
      ? `${letters[slide.correctIndex]}. ${slide.choices[slide.correctIndex]}`
      : slide.acceptedKeywords?.length
        ? `Keywords: ${slide.acceptedKeywords.join(", ")}`
        : "See explanation";

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-[var(--navy-deep)] text-white"
          : "overflow-hidden rounded-2xl bg-[var(--navy-deep)] text-white shadow-[0_20px_50px_rgba(11,31,51,0.25)]"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.14em] text-white/60">
        <span>
          Admin only · {quizTitle} · Slide {index + 1} / {total}
        </span>
        <div className="flex items-center gap-2 normal-case tracking-normal">
          <button
            type="button"
            onClick={() => setShowAnswer((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            {showAnswer ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showAnswer ? "Hide answer" : "Show answer"}
          </button>
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {fullscreen ? "Exit" : "Fullscreen"}
          </button>
        </div>
      </div>

      <div className={`flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 ${fullscreen ? "min-h-0 overflow-y-auto" : "min-h-[420px]"}`}>
        <p className="text-sm font-semibold text-[var(--amber)]">
          Q{slide.number} · {slide.topic} · {slide.type.replaceAll("_", " ")}
        </p>
        <h2 className="mt-4 max-w-4xl text-2xl font-bold leading-snug sm:text-3xl">{slide.prompt}</h2>

        {slide.choices && (
          <ul className="mt-8 max-w-3xl space-y-3">
            {slide.choices.map((choice, i) => {
              const isCorrect = showAnswer && slide.correctIndex === i;
              return (
                <li
                  key={`${slide.id}-${i}`}
                  className={`rounded-xl border px-4 py-3 text-sm sm:text-base ${
                    isCorrect
                      ? "border-[var(--amber)] bg-[var(--amber)]/15 text-white"
                      : "border-white/15 bg-white/5 text-white/90"
                  }`}
                >
                  <span className="mr-2 font-bold text-[var(--amber)]">{letters[i]}.</span>
                  {choice}
                  {isCorrect && <span className="ml-2 text-xs font-bold uppercase text-[var(--amber)]">Correct</span>}
                </li>
              );
            })}
          </ul>
        )}

        {showAnswer && (
          <div className="mt-8 max-w-3xl rounded-xl border border-[var(--amber)]/40 bg-[var(--amber)]/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--amber)]">Answer key</p>
            <p className="mt-2 text-lg font-semibold text-white">{correctLabel}</p>
            {slide.explanation && <p className="mt-3 text-sm leading-relaxed text-white/80">{slide.explanation}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <div className="flex max-w-[50%] flex-wrap justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-[var(--amber)]" : "bg-white/30 hover:bg-white/50"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index >= total - 1}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--amber)] px-4 py-2 text-sm font-bold text-[var(--navy-deep)] disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="px-5 pb-3 text-center text-[11px] text-white/45">
        Keys: ← → navigate · A toggle answer · F fullscreen
      </p>
    </div>
  );
}
