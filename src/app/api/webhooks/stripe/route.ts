import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/entitlements";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      metadata?: { orderId?: string };
      payment_intent?: string | null;
    };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const pi =
        typeof session.payment_intent === "string" ? session.payment_intent : undefined;
      await markOrderPaid(orderId, pi);
    } else if (session.id) {
      const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
      if (order) {
        const pi =
          typeof session.payment_intent === "string" ? session.payment_intent : undefined;
        await markOrderPaid(order.id, pi);
      }
    }
  }

  return NextResponse.json({ received: true });
}
