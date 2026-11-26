import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { loginHref } from "@/lib/auth-paths";

const COOKIE = "lsds_session";

async function readEdgeSession(req: NextRequest): Promise<{ role: string } | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return { role: String(payload.role || "") };
  } catch {
    return null;
  }
}

/**
 * Gate /app and /admin at the edge so unauthenticated visitors never flash the
 * protected UI — they go straight to /login?next=….
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await readEdgeSession(req);

  if (!session) {
    const next = `${pathname}${search || ""}`;
    return NextResponse.redirect(new URL(loginHref(next), req.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("x-url-path", pathname);
  return res;
}

export const config = {
  matcher: ["/app", "/app/:path*", "/admin", "/admin/:path*"],
};
