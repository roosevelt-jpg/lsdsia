import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  markUrl?: string;
  lockupUrl?: string;
  brandName?: string;
  variant?: "light" | "dark";
  showWordmark?: boolean;
  className?: string;
  markClassName?: string;
};

/**
 * Exact Life Star logo lockup from ChatGPT mockups.
 * Prefer the extracted PNG lockup on dark backgrounds; fall back to mark + text.
 */
export function BrandLogo({
  href = "/",
  markUrl = "/cms/logo-mark.svg",
  lockupUrl = "/cms/logo-full-light.png",
  brandName = "LIFE STAR INSTRUCTORS ACADEMY",
  variant = "light",
  showWordmark = true,
  className = "",
  markClassName = "h-9 w-auto",
}: BrandLogoProps) {
  const content = (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      {variant === "light" && lockupUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lockupUrl}
          alt={brandName}
          className={`h-10 w-auto max-w-[240px] object-contain object-left ${markClassName}`}
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markUrl} alt="" className={`shrink-0 object-contain ${markClassName}`} />
          {showWordmark && (
            <span
              className={`min-w-0 leading-tight ${
                variant === "dark" ? "text-[var(--navy)]" : "text-white"
              }`}
            >
              <span className="block font-[family-name:var(--font-marketing)] text-[13px] font-bold uppercase tracking-[0.06em]">
                Life Star
              </span>
              <span
                className={`block text-[9px] font-bold uppercase tracking-[0.14em] ${
                  variant === "dark" ? "text-[var(--navy)]/70" : "text-[var(--amber)]"
                }`}
              >
                Instructors Academy
              </span>
            </span>
          )}
        </>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex min-w-0 items-center" aria-label={brandName}>
      {content}
    </Link>
  );
}
