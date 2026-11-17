"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BuyButton({
  type,
  id,
  label,
  disabled,
}: {
  type: "lesson" | "practical" | "package";
  id: string;
  label: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  return (
    <div>
      <Button type="button" onClick={onBuy} disabled={disabled || loading}>
        {loading ? "Starting checkout…" : label}
      </Button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
