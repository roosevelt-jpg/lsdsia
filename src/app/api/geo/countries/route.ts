import { NextResponse } from "next/server";
import { listCountries } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ countries: listCountries() });
}
