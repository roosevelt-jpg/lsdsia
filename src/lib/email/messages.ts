import { EMAIL_BRAND, absoluteUrl } from "@/lib/email/brand";
import { brandedEmailHtml, escapeHtml, plainTextFromParts } from "@/lib/email/layout";
import { sendEmail, type SendEmailResult } from "@/lib/email/send";

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
}): Promise<SendEmailResult> {
  const dashboard = absoluteUrl("/app");
  const title = `Welcome to ${EMAIL_BRAND.name}`;
  const html = brandedEmailHtml({
    preheader: "Your Life Star instructor training account is ready.",
    title,
    bodyHtml: `<p>Hi ${escapeHtml(opts.name)},</p>
      <p>Welcome to <strong>${escapeHtml(EMAIL_BRAND.name)}</strong>. Your account is ready — complete onboarding, upload identity documents, and start your instructor pathway.</p>
      <p>Minnesota campus practicals are scheduled at ${escapeHtml(EMAIL_BRAND.address)}.</p>`,
    ctaLabel: "Open student portal",
    ctaHref: dashboard,
  });
  const text = plainTextFromParts([
    `Hi ${opts.name},`,
    `Welcome to ${EMAIL_BRAND.name}. Your account is ready.`,
    `Open your portal: ${dashboard}`,
    `${EMAIL_BRAND.address} · ${EMAIL_BRAND.phone}`,
  ]);
  return sendEmail({ to: opts.to, subject: title, html, text });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<SendEmailResult> {
  const title = "Reset your Life Star password";
  const html = brandedEmailHtml({
    preheader: "Use this one-hour link to choose a new password.",
    title,
    bodyHtml: `<p>Hi ${escapeHtml(opts.name)},</p>
      <p>We received a request to reset the password for your ${escapeHtml(EMAIL_BRAND.name)} account. This link expires in one hour.</p>
      <p>If you did not request a reset, you can ignore this email — your password will stay the same.</p>`,
    ctaLabel: "Reset password",
    ctaHref: opts.resetUrl,
  });
  const text = plainTextFromParts([
    `Hi ${opts.name},`,
    `Reset your Life Star password (expires in 1 hour): ${opts.resetUrl}`,
    `If you did not request this, ignore this email.`,
    `${EMAIL_BRAND.phone} · ${EMAIL_BRAND.supportEmail}`,
  ]);
  return sendEmail({ to: opts.to, subject: title, html, text });
}

export async function sendLicenseReviewEmail(opts: {
  to: string;
  name: string;
  decision: "approved" | "rejected";
  adminNote?: string | null;
}): Promise<SendEmailResult> {
  const approved = opts.decision === "approved";
  const title = approved
    ? "Identity documents approved"
    : "Identity documents need attention";
  const html = brandedEmailHtml({
    preheader: approved
      ? "Your Life Star identity verification was approved."
      : "Please review the note from Life Star admissions.",
    title,
    bodyHtml: `<p>Hi ${escapeHtml(opts.name)},</p>
      <p>Your driver’s license / passport submission was <strong>${escapeHtml(opts.decision)}</strong>.</p>
      ${opts.adminNote ? `<p><strong>Note from admissions:</strong> ${escapeHtml(opts.adminNote)}</p>` : ""}
      <p>${approved ? "You can continue in the student portal." : "Please update your documents in the portal and resubmit."}</p>`,
    ctaLabel: approved ? "Continue training" : "Update documents",
    ctaHref: absoluteUrl(approved ? "/app" : "/app/onboarding/license"),
  });
  const text = plainTextFromParts([
    `Hi ${opts.name},`,
    `Your identity documents were ${opts.decision}.`,
    opts.adminNote ? `Note: ${opts.adminNote}` : "",
    `Portal: ${absoluteUrl("/app")}`,
  ]);
  return sendEmail({ to: opts.to, subject: `${EMAIL_BRAND.shortName}: ${title}`, html, text });
}

export async function sendPracticumConfirmedEmail(opts: {
  to: string;
  name: string;
  sessionTitle: string;
  dates: string;
  location?: string | null;
}): Promise<SendEmailResult> {
  const title = "Practicum session confirmed";
  const location = opts.location || EMAIL_BRAND.address;
  const html = brandedEmailHtml({
    preheader: `${opts.sessionTitle} is confirmed at the Minnesota campus.`,
    title,
    bodyHtml: `<p>Hi ${escapeHtml(opts.name)},</p>
      <p>Your Minnesota campus practicum booking is <strong>confirmed</strong>.</p>
      <p><strong>${escapeHtml(opts.sessionTitle)}</strong><br/>${escapeHtml(opts.dates)}<br/>${escapeHtml(location)}</p>
      <p>Questions? Call ${escapeHtml(EMAIL_BRAND.phone)}.</p>`,
    ctaLabel: "View sessions",
    ctaHref: absoluteUrl("/app/practicum"),
  });
  const text = plainTextFromParts([
    `Hi ${opts.name},`,
    `Confirmed: ${opts.sessionTitle} (${opts.dates}) at ${location}`,
    `View: ${absoluteUrl("/app/practicum")}`,
  ]);
  return sendEmail({ to: opts.to, subject: `${EMAIL_BRAND.shortName}: ${title}`, html, text });
}

export async function sendCertificateIssuedEmail(opts: {
  to: string;
  name: string;
  verifyUrl: string;
}): Promise<SendEmailResult> {
  const title = "Your Life Star certificate is ready";
  const html = brandedEmailHtml({
    preheader: "Download and share your instructor academy certificate.",
    title,
    bodyHtml: `<p>Hi ${escapeHtml(opts.name)},</p>
      <p>Congratulations — your ${escapeHtml(EMAIL_BRAND.name)} digital certificate has been issued.</p>
      <p>You can view it in your portal and share the public verification link.</p>`,
    ctaLabel: "View certificate",
    ctaHref: absoluteUrl("/app/certificate"),
  });
  const text = plainTextFromParts([
    `Hi ${opts.name},`,
    `Your Life Star certificate is ready: ${absoluteUrl("/app/certificate")}`,
    `Verify: ${opts.verifyUrl}`,
  ]);
  return sendEmail({ to: opts.to, subject: title, html, text });
}

export { isResendConfigured } from "@/lib/email/send";
