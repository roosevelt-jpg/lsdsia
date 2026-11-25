import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { generateEnrollmentNumber } from "@/lib/student-id";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function enrollAction(formData: FormData) {
  "use server";
  const session = await requireUser(["candidate", "admin", "coach"]);
  const levelId = String(formData.get("levelId") || "");
  const level = await prisma.enrollmentLevel.findUnique({ where: { id: levelId } });
  if (!level) redirect("/app/enroll");

  const existing = await prisma.enrollment.findFirst({
    where: { userId: session.id, status: "active" },
  });
  if (existing) {
    await prisma.enrollment.update({
      where: { id: existing.id },
      data: { levelId: level.id },
    });
  } else {
    await prisma.enrollment.create({
      data: {
        userId: session.id,
        levelId: level.id,
        status: "active",
        enrollmentNumber: await generateEnrollmentNumber(),
      },
    });
  }
  redirect("/app/store");
}

export default async function EnrollPage() {
  const session = await requireUser();

  const [levels, enrollment] = await Promise.all([
    prisma.enrollmentLevel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        packages: true,
        lessonPrices: true,
        practicalPrices: true,
      },
    }),
    prisma.enrollment.findFirst({
      where: { userId: session.id, status: "active" },
      include: { level: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Enrollment level</h1>
      <p className="mt-2 text-[var(--steel)]">
        Your level sets à la carte online lesson and package prices. Classroom sessions ($15,000) and behind-the-wheel
        training ($7,000) use the same tuition for every level with a 50% down payment. Current:{" "}
        <strong>{enrollment?.level.name ?? "none"}</strong>.
      </p>
      <div className="mt-8 space-y-4">
        {levels.map((level) => (
          <Card key={level.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl text-[var(--navy)]">{level.name}</h2>
                <p className="mt-1 text-sm text-[var(--steel)]">{level.description}</p>
                <p className="mt-2 text-sm text-[var(--navy)]">
                  Lessons {formatUsd(level.lessonPrices[0]?.amountCents ?? 0)} · Online package{" "}
                  {formatUsd(level.packages[0]?.amountCents ?? 0)}
                </p>
              </div>
              <form action={enrollAction}>
                <input type="hidden" name="levelId" value={level.id} />
                <Button type="submit" variant={enrollment?.levelId === level.id ? "outline" : "default"}>
                  {enrollment?.levelId === level.id ? "Selected" : "Select"}
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
