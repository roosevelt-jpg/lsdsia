"use client";

import { useEffect, useRef, useState } from "react";

/** Hard countdown for practice exams — auto-submits the parent form when time expires. */
export function QuizTimer({
  startedAtIso,
  limitMinutes,
  formId,
}: {
  startedAtIso: string;
  limitMinutes: number;
  formId: string;
}) {
  const deadline = useRef(new Date(startedAtIso).getTime() + limitMinutes * 60_000);
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadline.current - Date.now()));
  const submitted = useRef(false);

  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, deadline.current - Date.now());
      setRemainingMs(left);
      if (left <= 0 && !submitted.current) {
        submitted.current = true;
        const form = document.getElementById(formId) as HTMLFormElement | null;
        form?.requestSubmit();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [formId]);

  const totalSec = Math.floor(remainingMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const urgent = totalSec <= 5 * 60;

  return (
    <p
      className={`mt-2 text-sm font-semibold ${urgent ? "text-red-700" : "text-[var(--navy)]"}`}
      role="timer"
      aria-live="polite"
    >
      Time remaining: {h > 0 ? `${h}:` : ""}
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      {totalSec === 0 ? " — time expired, submitting…" : ""}
    </p>
  );
}
