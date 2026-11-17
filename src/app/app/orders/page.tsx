import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { Card } from "@/components/ui/card";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const session = await requireUser();
  if (!session) return null;
  const params = await searchParams;

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Orders</h1>
      {params.paid && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Payment submitted. Access unlocks when the Stripe webhook marks the order paid (or admin grants access).
        </p>
      )}
      <div className="mt-6 space-y-3">
        {orders.length === 0 && <p className="text-sm text-[var(--steel)]">No orders yet.</p>}
        {orders.map((o) => (
          <Card key={o.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium capitalize text-[var(--navy)]">{o.status}</p>
              <p className="font-semibold">{formatUsd(o.totalCents)}</p>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-[var(--steel)]">
              {o.items.map((i) => (
                <li key={i.id}>{i.label}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[var(--steel)]">{o.createdAt.toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
