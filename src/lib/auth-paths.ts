/** Paths that require a signed-in session (and must not flash before login). */
export function isGatedPath(pathname: string): boolean {
  if (!pathname) return false;
  const path = pathname.split("?")[0].split("#")[0];
  return (
    path === "/app" ||
    path.startsWith("/app/") ||
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/onboarding" ||
    path.startsWith("/onboarding/")
  );
}

/** Only allow same-origin relative next paths (open-redirect safe). */
export function safeNextPath(raw: string | null | undefined, fallback = "/app"): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.startsWith("/login")) return fallback;
  return trimmed;
}

export function loginHref(nextPath: string): string {
  const next = safeNextPath(nextPath, "/app");
  return `/login?next=${encodeURIComponent(next)}`;
}

/**
 * For marketing nav/footer: send guests straight to login with next=, keep
 * authenticated users on the real destination. Handles absolute same-site URLs.
 */
export function publicNavHref(href: string, authenticated: boolean): string {
  if (!href || authenticated) return href;

  let pathWithSearch = href;
  try {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      const u = new URL(href);
      pathWithSearch = `${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    return href;
  }

  const pathOnly = pathWithSearch.split("#")[0].split("?")[0];
  if (!isGatedPath(pathOnly)) return href;
  // Preserve path+query for next; drop hash (login redirect can't use it server-side)
  const next = pathWithSearch.split("#")[0];
  return loginHref(next);
}
