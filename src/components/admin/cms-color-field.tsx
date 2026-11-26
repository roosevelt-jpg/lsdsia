"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Color picker + hex text that stay in sync; submits a single form field. */
export function CmsColorField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue || "#000000");
  const hexOk = /^#[0-9A-Fa-f]{6}$/.test(value);

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={hexOk ? value : "#000000"}
          onChange={(e) => setValue(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-[var(--navy)]/15 bg-white p-1"
          aria-label={`${label} picker`}
        />
        <Input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="font-mono text-xs"
          placeholder="#0B1F33"
        />
      </div>
    </div>
  );
}
