import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { ensureLoginUsers } from "@/lib/bootstrap-users";
import { prisma } from "@/lib/db";

export type Role = "candidate" | "coach" | "admin";

const COOKIE = "lsds_session";

function secret() {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) {
    throw new Error(
      "AUTH_SECRET is not set. Add AUTH_SECRET in Vercel → Settings → Environment Variables, then redeploy.",
    );
  }
  return new TextEncoder().encode(s);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser, opts?: { remember?: boolean }) {
  const days = opts?.remember ? 30 : 14;
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * days,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/** For API routes: return the session or null (caller should respond 401). */
export async function getAuthorizedUser(roles?: Role[]) {
  const session = await getSession();
  if (!session) return null;
  if (roles && !roles.includes(session.role)) return null;
  return session;
}

/** For pages and server actions: redirect to login when unauthorized. */
export async function requireUser(roles?: Role[]) {
  const session = await getAuthorizedUser(roles);
  if (!session) redirect("/login");
  return session;
}

export async function loginWithCredentials(
  email: string,
  password: string,
  opts?: { remember?: boolean },
) {
  try {
    const boot = await ensureLoginUsers();
    if (!boot.ok) return { error: boot.error };

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return {
        error:
          "Invalid email or password. Use admin@lifestar.academy or demo@lifestar.academy with the ADMIN_PASSWORD / DEMO_PASSWORD values from Vercel Environment Variables." as const,
      };
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return {
        error:
          "Invalid email or password. The password must match ADMIN_PASSWORD or DEMO_PASSWORD as set in Vercel (not an old README password)." as const,
      };
    }
    await createSession(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
      },
      { remember: opts?.remember },
    );
    return { user: { ...user, role: user.role as Role } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    console.error("loginWithCredentials", err);
    if (message.includes("AUTH_SECRET")) {
      return {
        error:
          "Server auth is not configured. Set AUTH_SECRET in Vercel Environment Variables and redeploy." as const,
      };
    }
    return {
      error:
        "Database unavailable. On Vercel set AUTH_SECRET, ADMIN_PASSWORD, and DEMO_PASSWORD, then Redeploy." as const,
    };
  }
}
