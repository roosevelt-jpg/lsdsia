import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

async function saveLessonPrice(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  const amountCents = Math.round(Number(formData.get("amount")) * 100);
  await prisma.lessonPrice.update({ where: { id }, data: { amountCents } });
  redirect("/admin/pricing?saved=1");
}

async function savePracticalPrice(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  const amountCents = Math.round(Number(formData.get("amount")) * 100);
  await prisma.practicalPrice.update({ where: { id }, data: { amountCents } });
  redirect("/admin/pricing?saved=1");
}

export default async function AdminPricingPage() {
  const levels = await prisma.enrollmentLevel.findMany({ orderBy: { sortOrder: "asc" } });
  const lessons = await prisma.lesson.findMany({
    include: { module: true, prices: true },
    orderBy: [{ module: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
  const practicals = await prisma.practicalSku.findMany({ include: { prices: true } });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Pricing matrices</h1>
      <p className="mt-2 text-sm text-[var(--steel)]">
        Program tuition × level (USD). Checkout charges the configured down payment percent; balance follows the
        installment months on each SKU.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-xl text-[var(--navy)]">Classroom & BTW programs</h2>
        {practicals.map((sku) => (
          <Card key={sku.id} className="mt-3">
            <p className="font-medium text-[var(--navy)]">{sku.name}</p>
            <p className="mt-1 text-xs text-[var(--steel)]">
              {sku.downPaymentPercent}% down · {sku.installmentMonths || "pay in full"}{" "}
              {sku.installmentMonths ? "month balance" : ""}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {levels.map((level) => {
                const price = sku.prices.find((p) => p.levelId === level.id);
                if (!price) return null;
                return (
                  <form key={price.id} action={savePracticalPrice} className="flex items-end gap-2">
                    <input type="hidden" name="id" value={price.id} />
                    <div className="flex-1">
                      <label className="text-xs text-[var(--steel)]">{level.name}</label>
                      <Input
                        name="amount"
                        type="number"
                        step="0.01"
                        defaultValue={(price.amountCents / 100).toFixed(2)}
                      />
                    </div>
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                  </form>
                );
              })}
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--navy)]">Lessons</h2>
        <div className="mt-3 space-y-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <p className="text-xs text-[var(--steel)]">{lesson.module.title}</p>
              <p className="font-medium text-[var(--navy)]">{lesson.title}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {levels.map((level) => {
                  const price = lesson.prices.find((p) => p.levelId === level.id);
                  if (!price) return null;
                  return (
                    <form key={price.id} action={saveLessonPrice} className="flex items-end gap-2">
                      <input type="hidden" name="id" value={price.id} />
                      <div className="flex-1">
                        <label className="text-xs text-[var(--steel)]">
                          {level.name} ({formatUsd(price.amountCents)})
                        </label>
                        <Input
                          name="amount"
                          type="number"
                          step="0.01"
                          defaultValue={(price.amountCents / 100).toFixed(2)}
                        />
                      </div>
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                    </form>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
