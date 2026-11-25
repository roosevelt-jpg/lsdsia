import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = (process.env.APP_URL || process.env.NEXTAUTH_URL || url.origin).replace(/\/$/, "");
  const code = url.searchParams.get("code");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Google sign-in failed or is not configured.")}`,
    );
  }

  try {
    const redirectUri = `${origin}/api/auth/oauth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Google token exchange failed.")}`);
    }
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Google did not return an access token.")}`);
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (!profileRes.ok) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Could not load Google profile.")}`);
    }
    const profile = (await profileRes.json()) as { email?: string; name?: string };
    if (!profile.email) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Google account has no email.")}`);
    }

    const email = profile.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: profile.name || email.split("@")[0] || "Student",
          passwordHash: await hashPassword(randomBytes(24).toString("hex")),
          role: "candidate",
          profile: { create: { onboardingStep: 0 } },
          applicationPacket: {
            create: {
              fullName: profile.name || email,
              employingSchoolName: "Life Star Driving School",
              employingSchoolAddress: "Minnesota main campus",
            },
          },
        },
      });
      await createSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: "candidate",
      });
      return NextResponse.redirect(`${origin}/onboarding/role`);
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "candidate" | "coach" | "admin",
    });
    const p = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (user.role === "admin") return NextResponse.redirect(`${origin}/admin`);
    if (!p?.profileCompletedAt) return NextResponse.redirect(`${origin}/onboarding/profile`);
    return NextResponse.redirect(`${origin}/app`);
  } catch (err) {
    console.error("google oauth callback", err);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Google sign-in failed.")}`);
  }
}
