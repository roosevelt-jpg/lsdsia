"use client";

import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Print ID card" }: { label?: string }) {
  return (
    <Button type="button" size="sm" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
