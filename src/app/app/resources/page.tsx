import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listMaterialsForUser } from "@/lib/learning-materials";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const session = await requireUser();
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "default" } });
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.id, status: "active" },
  });
  const materials = enrollment ? await listMaterialsForUser(session.id) : [];
  const docs = materials.filter((m) => m.kind === "document" || m.kind === "link");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Resources</h1>
      <p className="mt-2 text-[var(--steel)]">
        Checklists, support, and admin-published learning materials for Life Star Instructor Academy candidates.
      </p>
      <div className="mt-6 space-y-4">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg text-[var(--navy)]">Videos & materials library</h2>
            <Link href="/app/videos" className="text-sm font-semibold text-[#2b6cb0] hover:underline">
              Open videos →
            </Link>
          </div>
          {!enrollment && (
            <p className="mt-2 text-sm text-[var(--steel)]">
              Enroll to access admin-curated video and document links on your dashboard.
            </p>
          )}
          {enrollment && docs.length === 0 && materials.length === 0 && (
            <p className="mt-2 text-sm text-[var(--steel)]">No published materials yet.</p>
          )}
          {enrollment && materials.length > 0 && (
            <ul className="mt-3 space-y-2">
              {materials.map((m) => (
                <li key={m.id}>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border border-[var(--navy)]/10 px-3 py-2 text-sm text-[var(--navy)] hover:border-[#2b6cb0]/40"
                  >
                    <span>
                      <span className="font-medium">{m.title}</span>
                      <span className="ml-2 text-xs uppercase text-[var(--steel)]">{m.kind}</span>
                    </span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[var(--steel)]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-display text-lg text-[var(--navy)]">Instructor application</h2>
          <p className="mt-2 text-sm text-[var(--steel)]">
            Complete the PS36008-10 preparation packet, upload required attachments, then download the PDF.
          </p>
          <Link href="/app/application" className="mt-3 inline-block text-sm font-semibold text-[#2b6cb0] underline">
            Open application →
          </Link>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-[var(--navy)]">Exam day tips</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--steel)]">
            <li>Practice exam mirrors the Q&A bank (~125 items); state exam cites ~100 scored questions</li>
            <li>Pass at 80% or higher; academy practice exam uses a hard 4-hour timer with auto-submit</li>
            <li>Bring a pencil; contact Life Star support if problems arise before campus</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-[var(--navy)]">Campus travel</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--steel)]">
            <li>Destination: {settings?.address ?? "Minnesota main campus"}</li>
            <li>
              Export your{" "}
              <Link href="/app/application/pdf" className="underline">
                application PDF
              </Link>{" "}
              before you travel
            </li>
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
