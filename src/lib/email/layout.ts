import { EMAIL_BRAND, absoluteUrl } from "@/lib/email/brand";

export function brandedEmailHtml(opts: {
  preheader?: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const logo = absoluteUrl(EMAIL_BRAND.logoUrl);
  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<p style="margin:28px 0 8px;">
          <a href="${escapeAttr(opts.ctaHref)}"
             style="display:inline-block;background:${EMAIL_BRAND.amber};color:${EMAIL_BRAND.navyDeep};text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:8px;">
            ${escapeHtml(opts.ctaLabel)}
          </a>
        </p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.mist};font-family:Georgia,'Times New Roman',serif;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_BRAND.mist};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(11,31,51,0.12);">
          <tr>
            <td style="background:${EMAIL_BRAND.navyDeep};padding:22px 28px;">
              <img src="${escapeAttr(logo)}" alt="${escapeHtml(EMAIL_BRAND.name)}" width="200" style="display:block;max-width:200px;height:auto;border:0;" />
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                Learn globally · Train professionally · Lead confidently
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">
              <div style="height:4px;width:64px;background:${EMAIL_BRAND.amber};border-radius:2px;margin-bottom:18px;"></div>
              <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:${EMAIL_BRAND.navy};">${escapeHtml(opts.title)}</h1>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#334155;">
                ${opts.bodyHtml}
              </div>
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;color:#64748b;">
              <p style="margin:0 0 6px;"><strong style="color:${EMAIL_BRAND.navy};">${escapeHtml(EMAIL_BRAND.name)}</strong></p>
              <p style="margin:0;">${escapeHtml(EMAIL_BRAND.address)}</p>
              <p style="margin:0;">Phone ${escapeHtml(EMAIL_BRAND.phone)} · ${escapeHtml(EMAIL_BRAND.supportEmail)}</p>
              <p style="margin:12px 0 0;">Owner: ${escapeHtml(EMAIL_BRAND.owner)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

export function plainTextFromParts(lines: string[]) {
  return lines.filter(Boolean).join("\n\n");
}
