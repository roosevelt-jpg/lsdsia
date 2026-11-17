import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await getSession();
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="font-display text-lg tracking-wide text-white drop-shadow">
          Life Star Driving School
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/pricing" className="hidden text-sm text-white/85 hover:text-white sm:inline">
            Pricing
          </Link>
          {session ? (
            <>
              <Button asChild size="sm" variant="secondary">
                <Link href="/app">Dashboard</Link>
              </Button>
              {session.role === "admin" && (
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="secondary">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Start learning</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
