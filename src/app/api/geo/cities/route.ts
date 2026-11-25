import { NextRequest, NextResponse } from "next/server";
import { listCities } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const country = String(req.nextUrl.searchParams.get("country") || "").trim();
  const state = String(req.nextUrl.searchParams.get("state") || "").trim();
  if (!country) {
    return NextResponse.json({ cities: [] });
  }
  const cities = listCities(country, state || undefined);
  // Cap payload for very large country-wide lists; client can still type a custom city.
  const capped = cities.length > 5000 ? cities.slice(0, 5000) : cities;
  return NextResponse.json({ cities: capped, total: cities.length, truncated: capped.length < cities.length });
}
