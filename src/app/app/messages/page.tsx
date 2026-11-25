import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const messages = [
  {
    id: "1",
    from: "Life Star Admissions",
    subject: "Welcome to the Instructor Academy",
    preview: "Your account is ready. Upload your license and start your first lesson when you are ready.",
    time: "Today",
  },
  {
    id: "2",
    from: "Campus Practicals",
    subject: "Minnesota campus scheduling tips",
    preview: "Book practical credits from the store, then request a practicum date from Live Sessions.",
    time: "Yesterday",
  },
  {
    id: "3",
    from: "School Launch Coach",
    subject: "After certification — open your school",
    preview: "When you earn your certificate, use Open a school coaching for DMV/operator packet readiness.",
    time: "This week",
  },
];

export default async function MessagesPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--navy)]">Messages</h1>
      <p className="mt-1 text-sm text-[var(--steel)]">Academy notices and coaching updates.</p>
      <ul className="mt-6 space-y-3">
        {messages.map((m) => (
          <li key={m.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[var(--navy)]/8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--amber)]">{m.from}</p>
                <p className="mt-1 font-semibold text-[var(--navy)]">{m.subject}</p>
                <p className="mt-1 text-sm text-[var(--steel)]">{m.preview}</p>
              </div>
              <span className="shrink-0 text-xs text-[var(--steel)]">{m.time}</span>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/app/support" className="mt-6 inline-block text-sm font-semibold text-[#2b6cb0] hover:underline">
        Need help? Contact support →
      </Link>
    </div>
  );
}
