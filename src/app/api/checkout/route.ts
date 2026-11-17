import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe, paymentsMessage, stripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await requireUser(["candidate", "admin", "coach"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripeConfigured()) {
    return NextResponse.json({ error: paymentsMessage() }, { status: 503 });
  }

  const body = (await req.json()) as {
    type: "lesson" | "practical" | "package";
    id: string;
  };

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.id, status: "active" },
    include: { level: true },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Choose an enrollment level first." }, { status: 400 });
  }

  let label = "";
  let amountCents = 0;
  let lessonId: string | undefined;
  let practicalSkuId: string | undefined;
  let packageId: string | undefined;

  if (body.type === "lesson") {
    const lesson = await prisma.lesson.findUnique({
      where: { id: body.id },
      include: { prices: true },
    });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    const price = lesson.prices.find((p) => p.levelId === enrollment.levelId);
    if (!price) return NextResponse.json({ error: "No price for your level" }, { status: 400 });
    label = `Online lesson — ${enrollment.level.name}: ${lesson.title}`;
    amountCents = price.amountCents;
    lessonId = lesson.id;
  } else if (body.type === "practical") {
    const sku = await prisma.practicalSku.findUnique({
      where: { id: body.id },
      include: { prices: true },
    });
    if (!sku) return NextResponse.json({ error: "Practical not found" }, { status: 404 });
    const price = sku.prices.find((p) => p.levelId === enrollment.levelId);
    if (!price) return NextResponse.json({ error: "No price for your level" }, { status: 400 });
    label = `Campus practical — ${enrollment.level.name}: ${sku.name}`;
    amountCents = price.amountCents;
    practicalSkuId = sku.id;
  } else if (body.type === "package") {
    const pkg = await prisma.levelPackage.findUnique({ where: { id: body.id } });
    if (!pkg || pkg.levelId !== enrollment.levelId) {
      return NextResponse.json({ error: "Package not available for your level" }, { status: 400 });
    }
    label = pkg.name;
    amountCents = pkg.amountCents;
    packageId = pkg.id;
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      userId: session.id,
      status: "pending",
      totalCents: amountCents,
      items: {
        create: {
          type: body.type,
          label,
          amountCents,
          lessonId,
          practicalSkuId,
          packageId,
        },
      },
    },
  });

  const stripe = getStripe()!;
  const origin = process.env.NEXTAUTH_URL || "http://127.0.0.1:3047";
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/app/orders?paid=1&order=${order.id}`,
    cancel_url: `${origin}/app/store?canceled=1`,
    customer_email: session.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: { name: label },
        },
      },
    ],
    metadata: { orderId: order.id, userId: session.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkout.id },
  });

  return NextResponse.json({ url: checkout.url });
}
