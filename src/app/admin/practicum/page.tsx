import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function confirmBooking(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  if (!admin) redirect("/login");
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

export default async function AdminPracticumPage() {
  const bookings = await prisma.practicumBooking.findMany({
    include: { user: true, session: true },
    orderBy: { createdAt: "desc" },
  });
  const sessions = await prisma.practicumSession.findMany({ orderBy: { startDate: "asc" } });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Practicum calendar</h1>
      <section className="mt-6">
        <h2 className="font-display text-lg text-[var(--navy)]">Sessions</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-md bg-white px-4 py-3 ring-1 ring-[var(--navy)]/10">
              {s.title}: {s.startDate} → {s.endDate} (cap {s.capacity})
            </li>
          ))}
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
