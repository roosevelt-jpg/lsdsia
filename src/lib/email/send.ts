import { Resend } from "resend";
import { emailFromAddress, isResendConfigured } from "@/lib/email/brand";

export type SendEmailResult =
  | { ok: true; id?: string; skipped?: false }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; error: string };

let client: Resend | null = null;

function getClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

/**
 * Send a branded Life Star email via Resend.
 * When RESEND_API_KEY is missing, returns skipped (callers show a clear fallback).
 */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    console.warn("[email] RESEND_API_KEY not set — skipping send:", opts.subject);
    return {
      ok: true,
      skipped: true,
      reason:
        "Email is not configured. Add the Resend Marketplace plugin (or set RESEND_API_KEY and EMAIL_FROM) in Vercel, then redeploy.",
    };
  }

  const resend = getClient();
  if (!resend) {
    return { ok: false, error: "Resend client failed to initialize." };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailFromAddress(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error("[email] Resend error", error);
      return { ok: false, error: error.message || "Resend send failed" };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    console.error("[email] send exception", err);
    return { ok: false, error: message };
  }
}

export { isResendConfigured };
