import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";

export default async function ResourcesPage() {
  await requireUser();
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "default" } });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Resources</h1>
      <p className="mt-2 text-[var(--steel)]">
        Checklists and support for Life Star Instructor Academy candidates.
      </p>
      <div className="mt-6 space-y-4">
        <Card>
          <h2 className="font-display text-lg text-[var(--navy)]">Exam day tips</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--steel)]">
            <li>About 100 scored questions; pass at 80% or higher</li>
            <li>Plan for roughly a 4-hour soft time limit; arrive early</li>
            <li>Bring a pencil; contact Life Star support if problems arise before campus</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-[var(--navy)]">Campus travel</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--steel)]">
            <li>Destination: {settings?.address ?? "Minnesota main campus"}</li>
            <li>Export your application packet before you travel</li>
            <li>Confirm practicum booking status in the academy</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-[var(--navy)]">Support</h2>
          <p className="mt-2 text-sm text-[var(--steel)]">
            {settings?.supportEmail} · {settings?.supportPhone}
          </p>
        </Card>
      </div>
    </div>
  );
}
