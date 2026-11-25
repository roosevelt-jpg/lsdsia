import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const origin = (process.env.APP_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin).replace(/\/$/, "");
  if (!clientId || !process.env.AZURE_AD_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "Microsoft sign-in is not configured. Set AZURE_AD_CLIENT_ID and AZURE_AD_CLIENT_SECRET (and APP_URL) in Vercel, then redeploy.",
      )}`,
    );
  }

  const tenant = process.env.AZURE_AD_TENANT_ID || "common";
  const redirectUri = `${origin}/api/auth/oauth/microsoft/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: "openid profile email User.Read",
  });
  return NextResponse.redirect(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params}`);
}
