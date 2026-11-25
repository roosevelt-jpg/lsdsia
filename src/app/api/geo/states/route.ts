import { NextRequest, NextResponse } from "next/server";
import { listStates } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const country = String(req.nextUrl.searchParams.get("country") || "").trim();
  if (!country) {
    return NextResponse.json({ states: [] });
  }
  return NextResponse.json({ states: listStates(country) });
}
