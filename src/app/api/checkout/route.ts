import { NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downPaymentCents, formatUsd, paymentPlanSummary } from "@/lib/money";
import { getStripe, paymentsMessage, stripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getAuthorizedUser(["candidate", "admin", "coach"]);
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
  let programTotalCents = 0;
  let chargeCents = 0;
  let lessonId: string | undefined;
  let practicalSkuId: string | undefined;
  let packageId: string | undefined;
  let planNote = "";

  if (body.type === "lesson") {
    const lesson = await prisma.lesson.findUnique({
      where: { id: body.id },
      include: { prices: true },
    });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    const price = lesson.prices.find((p) => p.levelId === enrollment.levelId);
    if (!price) return NextResponse.json({ error: "No price for your level" }, { status: 400 });
    label = `Online lesson — ${enrollment.level.name}: ${lesson.title}`;
    programTotalCents = price.amountCents;
    chargeCents = price.amountCents;
    lessonId = lesson.id;
  } else if (body.type === "practical") {
    const sku = await prisma.practicalSku.findUnique({
      where: { id: body.id },
      include: { prices: true },
    });
    if (!sku) return NextResponse.json({ error: "Practical not found" }, { status: 404 });
    const price = sku.prices.find((p) => p.levelId === enrollment.levelId);
    if (!price) return NextResponse.json({ error: "No price for your level" }, { status: 400 });
    programTotalCents = price.amountCents;
    const months = sku.installmentMonths ?? 0;
    const downPct = sku.downPaymentPercent ?? 50;
    if (months > 0) {
      chargeCents = downPaymentCents(programTotalCents, downPct);
      planNote = paymentPlanSummary(programTotalCents, downPct, months);
      label = `${sku.name} — ${downPct}% down payment (${formatUsd(chargeCents)} of ${formatUsd(programTotalCents)})`;
    } else {
      chargeCents = programTotalCents;
      label = `${sku.name} — ${formatUsd(programTotalCents)}`;
    }
    practicalSkuId = sku.id;
  } else if (body.type === "package") {
    const pkg = await prisma.levelPackage.findUnique({ where: { id: body.id } });
    if (!pkg || pkg.levelId !== enrollment.levelId) {
      return NextResponse.json({ error: "Package not available for your level" }, { status: 400 });
    }
    label = pkg.name;
    programTotalCents = pkg.amountCents;
    chargeCents = pkg.amountCents;
    packageId = pkg.id;
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      userId: session.id,
      status: "pending",
      totalCents: chargeCents,
      items: {
        create: {
          type: body.type,
          label: planNote ? `${label}. Plan: ${planNote}` : label,
          amountCents: chargeCents,
          lessonId,
          practicalSkuId,
          packageId,
        },
      },
    },
  });

  const stripe = getStripe()!;
  const origin = process.env.NEXTAUTH_URL || "http://127.0.0.1:3047";
  const productName = planNote
    ? `${label} — remaining balance billed per Life Star payment plan`
    : label;
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
          unit_amount: chargeCents,
          product_data: { name: productName },
        },
      },
    ],
    metadata: {
      orderId: order.id,
      userId: session.id,
      programTotalCents: String(programTotalCents),
      chargedCents: String(chargeCents),
      planNote: planNote.slice(0, 450),
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkout.id },
  });

  return NextResponse.json({ url: checkout.url });
}
