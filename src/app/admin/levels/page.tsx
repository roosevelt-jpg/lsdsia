import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

async function updatePackage(formData: FormData) {
  "use server";
  const admin = await requireUser(["admin"]);
  const id = String(formData.get("id") || "");
  const amountCents = Math.round(Number(formData.get("amount")) * 100);
  if (!id || !Number.isFinite(amountCents)) redirect("/admin/levels");
  await prisma.levelPackage.update({ where: { id }, data: { amountCents } });
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "admin.package_price",
      metaJson: JSON.stringify({ id, amountCents }),
    },
  });
  redirect("/admin/levels?saved=1");
}

export default async function AdminLevelsPage() {
  const levels = await prisma.enrollmentLevel.findMany({
    orderBy: { sortOrder: "asc" },
    include: { packages: true },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Enrollment levels</h1>
      <div className="mt-6 space-y-4">
        {levels.map((level) => (
          <Card key={level.id}>
            <h2 className="font-display text-xl text-[var(--navy)]">
              {level.name} <span className="text-sm text-[var(--steel)]">({level.code})</span>
            </h2>
            <p className="mt-1 text-sm text-[var(--steel)]">{level.description}</p>
            {level.packages.map((pkg) => (
              <form key={pkg.id} action={updatePackage} className="mt-4 flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={pkg.id} />
                <div>
                  <label className="text-xs text-[var(--steel)]">{pkg.name} (USD)</label>
                  <Input
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={(pkg.amountCents / 100).toFixed(2)}
                  />
                </div>
                <Button type="submit" size="sm">
                  Save package price
                </Button>
                <span className="text-xs text-[var(--steel)]">Current {formatUsd(pkg.amountCents)}</span>
              </form>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
