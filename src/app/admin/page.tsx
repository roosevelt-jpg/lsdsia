import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";

export default async function AdminHome() {
  const [candidates, orders, questions, bookings] = await Promise.all([
    prisma.user.count({ where: { role: "candidate" } }),
    prisma.order.count(),
    prisma.question.count(),
    prisma.practicumBooking.count({ where: { status: "requested" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Admin</h1>
      <p className="mt-2 text-[var(--steel)]">Life Star Driving School Instructor Academy operations.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-[var(--steel)]">Candidates</p>
          <p className="font-display text-3xl text-[var(--navy)]">{candidates}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">Orders</p>
          <p className="font-display text-3xl text-[var(--navy)]">{orders}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">Quiz questions</p>
          <p className="font-display text-3xl text-[var(--navy)]">{questions}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--steel)]">Practicum requests</p>
          <p className="font-display text-3xl text-[var(--navy)]">{bookings}</p>
        </Card>
      </div>
    </div>
  );
}
