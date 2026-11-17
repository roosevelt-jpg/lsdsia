import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/entitlements";
import { formatUsd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function markPaid(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const orderId = String(formData.get("orderId") || "");
  await markOrderPaid(orderId);
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "admin.mark_paid",
      metaJson: JSON.stringify({ orderId }),
    },
  });
  redirect("/admin/orders?paid=1");
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Orders</h1>
      <p className="mt-2 text-sm text-[var(--steel)]">
        Stripe-linked orders appear with session IDs. Use mark paid for wire/cash exceptions.
      </p>
      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <Card key={o.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-[var(--navy)]">
                  {o.user.name} · <span className="capitalize">{o.status}</span>
                </p>
                <p className="text-sm text-[var(--steel)]">
                  {formatUsd(o.totalCents)} · {o.createdAt.toLocaleString()}
                </p>
                {o.stripeSessionId && (
                  <p className="text-xs text-[var(--steel)]">Stripe session: {o.stripeSessionId}</p>
                )}
                <ul className="mt-1 text-sm text-[var(--steel)]">
                  {o.items.map((i) => (
                    <li key={i.id}>{i.label}</li>
                  ))}
                </ul>
              </div>
              {o.status === "pending" && (
                <form action={markPaid}>
                  <input type="hidden" name="orderId" value={o.id} />
                  <Button type="submit" size="sm">
                    Mark paid & grant access
                  </Button>
                </form>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
