import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-url-path", req.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
