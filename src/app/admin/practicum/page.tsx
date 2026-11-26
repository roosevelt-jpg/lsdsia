import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function confirmBooking(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  await prisma.practicumBooking.update({
    where: { id },
    data: { status: "confirmed", adminNote: "Confirmed by Life Star admin" },
  });
  await prisma.auditLog.create({
    data: { userId: admin.id, action: "admin.practicum_confirm", metaJson: JSON.stringify({ id }) },
  });
  redirect("/admin/practicum?ok=1");
}

export default async function AdminPracticumPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; session?: string }>;
}) {
  const params = await searchParams;
  const sessionFilter = params.session || undefined;

  const bookings = await prisma.practicumBooking.findMany({
    where: sessionFilter ? { sessionId: sessionFilter } : undefined,
    include: { user: true, session: true },
    orderBy: { createdAt: "desc" },
  });
  const sessions = await prisma.practicumSession.findMany({ orderBy: { startDate: "asc" } });
  const focus = sessionFilter ? sessions.find((s) => s.id === sessionFilter) : null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[var(--navy)]">Practical training bookings</h1>
          <p className="mt-2 text-sm text-[var(--steel)]">
            Confirm candidate requests for Minnesota campus sessions. Manage the calendar at{" "}
            <Link href="/admin/schedule" className="font-semibold text-[#2b6cb0] underline">
              Class & practicum schedule
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/schedule"
          className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--navy-deep)]"
        >
          Open calendar
        </Link>
      </div>

      {params.ok && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Booking confirmed.</p>
      )}
      {focus && (
        <p className="mt-4 rounded-lg bg-[var(--mist)] px-3 py-2 text-sm text-[var(--navy)]">
          Filtered to <strong>{focus.title}</strong> ({focus.startDate}
          {focus.endDate !== focus.startDate ? ` → ${focus.endDate}` : ""}).{" "}
          <Link href="/admin/practicum" className="font-semibold text-[#2b6cb0] underline">
            Show all
          </Link>
        </p>
      )}

      <section className="mt-6">
        <h2 className="font-display text-lg text-[var(--navy)]">Sessions</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-md bg-white px-4 py-3 ring-1 ring-[var(--navy)]/10">
              <span className="mr-2 rounded bg-[var(--mist)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--steel)]">
                {s.kind}
              </span>
              {s.title}: {s.startDate} → {s.endDate} (cap {s.capacity}) · {s.location}
            </li>
          ))}
          {sessions.length === 0 && (
            <li className="text-[var(--steel)]">
              No sessions —{" "}
              <Link href="/admin/schedule" className="underline">
                create on the schedule
              </Link>
              .
            </li>
          )}
        </ul>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="font-display text-lg text-[var(--navy)]">Bookings</h2>
        {bookings.map((b) => (
          <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-[var(--navy)]">
                {b.user.name} · {b.session.title}
              </p>
              <p className="text-sm capitalize text-[var(--steel)]">{b.status.replaceAll("_", " ")}</p>
            </div>
            {b.status === "requested" && (
              <form action={confirmBooking}>
                <input type="hidden" name="id" value={b.id} />
                <Button type="submit" size="sm">
                  Confirm
                </Button>
              </form>
            )}
          </Card>
        ))}
        {bookings.length === 0 && <p className="text-sm text-[var(--steel)]">No bookings yet.</p>}
      </section>
    </div>
  );
}
