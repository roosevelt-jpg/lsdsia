import Link from "next/link";
import { getSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

const links = [
  { href: "/app", label: "Home" },
  { href: "/app/onboarding/license", label: "License" },
  { href: "/app/enroll", label: "Level" },
  { href: "/app/store", label: "Store" },
  { href: "/app/learn", label: "Learn" },
  { href: "/app/quiz", label: "Quiz" },
  { href: "/app/application", label: "Application" },
  { href: "/app/practicum", label: "Practicum" },
  { href: "/app/school-launch", label: "Open a school" },
  { href: "/app/orders", label: "Orders" },
  { href: "/app/resources", label: "Resources" },
];

async function logout() {
  "use server";
  await destroySession();
  redirect("/");
}

export async function AppNav() {
  const session = await getSession();
  return (
    <aside className="border-b border-[var(--navy)]/10 bg-[var(--navy)] text-white md:min-h-screen md:w-56 md:border-b-0 md:border-r">
      <div className="px-4 py-5">
        <Link href="/" className="font-display text-base tracking-wide">
          Life Star
        </Link>
        <p className="mt-1 text-xs text-white/60">Instructor Academy</p>
        {session && (
          <p className="mt-3 truncate text-xs text-[var(--amber)]">{session.name}</p>
        )}
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
          >
            {l.label}
          </Link>
        ))}
        {session?.role === "admin" && (
          <Link
            href="/admin"
            className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-[var(--amber)] hover:bg-white/10"
          >
            Admin
          </Link>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="w-full whitespace-nowrap rounded-md px-3 py-2 text-left text-sm text-white/60 hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </form>
      </nav>
    </aside>
  );
}
