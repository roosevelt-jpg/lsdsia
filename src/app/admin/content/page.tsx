import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";

export default async function AdminContentPage() {
  const modules = await prisma.module.findMany({
    orderBy: { sortOrder: "asc" },
    include: { lessons: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Content</h1>
      <p className="mt-2 text-sm text-[var(--steel)]">
        Modules and lessons seeded for v1. Full CRUD editor can expand later; prices are editable under Pricing.
      </p>
      <div className="mt-6 space-y-4">
        {modules.map((m) => (
          <Card key={m.id}>
            <h2 className="font-display text-lg text-[var(--navy)]">
              {m.sortOrder}. {m.title}
            </h2>
            <p className="text-sm text-[var(--steel)]">{m.description}</p>
            <ul className="mt-3 space-y-1 text-sm text-[var(--navy)]">
              {m.lessons.map((l) => (
                <li key={l.id}>
                  {l.sortOrder}. {l.title}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
