import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-screen bg-[var(--mist)] md:flex">
      <AppNav />
      <div className="flex-1 px-5 py-8 md:px-8">{children}</div>
    </div>
  );
}
