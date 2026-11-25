import { NextResponse } from "next/server";

/**
 * Starts Google OAuth when GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / APP_URL are configured.
 * Without credentials, redirects back to login with a clear setup message.
 */
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = (process.env.APP_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin).replace(/\/$/, "");
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (and APP_URL) in Vercel, then redeploy.",
      )}`,
    );
  }

  const redirectUri = `${origin}/api/auth/oauth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
