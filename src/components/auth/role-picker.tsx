"use client";

import { useState } from "react";
import { GraduationCap, UserRound, Settings, Check, ArrowRight } from "lucide-react";

const roles = [
  {
    value: "candidate",
    label: "Student (Trainee)",
    description: "I want to become a certified driving instructor.",
    icon: GraduationCap,
  },
  {
    value: "coach",
    label: "Instructor",
    description: "I'm a certified instructor or trainer.",
    icon: UserRound,
  },
  {
    value: "admin",
    label: "Administrator",
    description: "I manage training, users, and academy operations.",
    icon: Settings,
  },
] as const;

export function RolePicker({
  action,
  inviteRequired,
}: {
  action: (formData: FormData) => Promise<void>;
  inviteRequired: boolean;
}) {
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("candidate");

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      <div className="space-y-3">
        {roles.map((r) => {
          const Icon = r.icon;
          const selected = role === r.value;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-[var(--navy)] bg-[var(--navy)]/5 shadow-sm"
                  : "border-[var(--navy)]/12 hover:border-[var(--navy)]/30"
              }`}
            >
              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  selected ? "bg-[var(--navy)] text-[var(--amber)]" : "bg-[var(--mist)] text-[var(--navy)]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[var(--navy)]">{r.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--steel)]">{r.description}</span>
              </span>
              {selected && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--navy)] text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {role === "admin" && inviteRequired && (
        <div>
          <label htmlFor="inviteCode" className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">
            Administrator invite code
          </label>
          <input
            id="inviteCode"
            name="inviteCode"
            required
            className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
            placeholder="Required for admin accounts"
          />
        </div>
      )}

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--amber)] px-4 py-3 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
