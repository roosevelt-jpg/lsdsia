import { prisma } from "@/lib/db";

export async function userHasLessonAccess(userId: string, lessonId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === "admin" || user?.role === "coach") return true;
  const ent = await prisma.entitlement.findFirst({
    where: { userId, lessonId },
  });
  return Boolean(ent);
}

export async function userPracticalCredits(userId: string, practicalSkuId: string) {
  const ents = await prisma.entitlement.findMany({
    where: { userId, practicalSkuId },
  });
  return ents.reduce((sum, e) => sum + e.creditsRemaining, 0);
}

export async function grantOrderEntitlements(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.status !== "paid") return;

  for (const item of order.items) {
    if (item.type === "lesson" && item.lessonId) {
      await prisma.entitlement.create({
        data: {
          userId: order.userId,
          lessonId: item.lessonId,
          sourceOrderId: order.id,
        },
      });
    }
    if (item.type === "practical" && item.practicalSkuId) {
      await prisma.entitlement.create({
        data: {
          userId: order.userId,
          practicalSkuId: item.practicalSkuId,
          creditsRemaining: 1,
          sourceOrderId: order.id,
        },
      });
    }
    if (item.type === "package" && item.packageId) {
      const pkg = await prisma.levelPackage.findUnique({
        where: { id: item.packageId },
      });
      if (!pkg) continue;
      if (pkg.includesAllLessons) {
        const lessons = await prisma.lesson.findMany({ select: { id: true } });
        for (const lesson of lessons) {
          const exists = await prisma.entitlement.findFirst({
            where: { userId: order.userId, lessonId: lesson.id },
          });
          if (!exists) {
            await prisma.entitlement.create({
              data: {
                userId: order.userId,
                lessonId: lesson.id,
                sourceOrderId: order.id,
              },
            });
          }
        }
      }
      if (pkg.includesPracticalSkuId) {
        await prisma.entitlement.create({
          data: {
            userId: order.userId,
            practicalSkuId: pkg.includesPracticalSkuId,
            creditsRemaining: 1,
            sourceOrderId: order.id,
          },
        });
      }
    }
  }
}

export async function markOrderPaid(orderId: string, stripePaymentIntentId?: string) {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) return null;
  if (existing.status === "paid") return existing;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      paidAt: new Date(),
      stripePaymentIntentId: stripePaymentIntentId ?? existing.stripePaymentIntentId,
    },
  });
  await grantOrderEntitlements(order.id);
  await prisma.auditLog.create({
    data: {
      userId: order.userId,
      action: "order.paid",
      metaJson: JSON.stringify({ orderId: order.id }),
    },
  });
  return order;
}
