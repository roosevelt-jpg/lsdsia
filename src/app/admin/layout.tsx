import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, destroySession } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/levels", label: "Levels" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/candidates", label: "Candidates" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/quizzes", label: "Quizzes" },
  { href: "/admin/practicum", label: "Practicum" },
];

async function logout() {
  "use server";
  await destroySession();
  redirect("/");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["admin"]);
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--mist)] md:flex">
      <aside className="border-b border-white/10 bg-[var(--navy-deep)] text-white md:min-h-screen md:w-56 md:border-b-0 md:border-r">
        <div className="px-4 py-5">
          <Link href="/" className="font-display text-base">
            Life Star Admin
          </Link>
          <p className="mt-1 text-xs text-white/50">{user.email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/app" className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-[var(--amber)]">
            Candidate view
          </Link>
          <form action={logout}>
            <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-white/50 hover:bg-white/10">
              Log out
            </button>
          </form>
        </nav>
      </aside>
      <div className="flex-1 px-5 py-8 md:px-8">{children}</div>
    </div>
  );
}
