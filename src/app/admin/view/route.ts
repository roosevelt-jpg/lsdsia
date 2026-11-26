import { NextRequest, NextResponse } from "next/server";
import { CONSOLE_VIEW_COOKIE, type ConsoleView } from "@/lib/console-view";

/** Switch Role: persist console view and land on the matching home. */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode");
  const view: ConsoleView = mode === "instructor" ? "instructor" : "admin";
  const dest = view === "instructor" ? "/admin/teach" : "/admin";
  const res = NextResponse.redirect(new URL(dest, req.url));
  res.cookies.set(CONSOLE_VIEW_COOKIE, view, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
