import Link from "next/link";
import { ExternalLink, Play, FileText, Link2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listMaterialsForUser, materialThumbnail } from "@/lib/learning-materials";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const session = await requireUser();
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.id, status: "active" },
    include: { level: true },
  });
  const isStaff = session.role === "admin" || session.role === "coach";
  const materials =
    enrollment || isStaff
      ? await (enrollment
          ? listMaterialsForUser(session.id)
          : prisma.learningMaterial.findMany({
              where: { isActive: true },
              include: { level: true },
              orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
            }))
      : [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--navy)]">Videos & learning materials</h1>
      <p className="mt-2 text-[var(--steel)]">
        Links curated by Life Star for enrolled students — watch online lessons and open supporting materials.
      </p>

      {!enrollment && !isStaff && (
        <Card className="mt-6 space-y-3">
          <p className="text-sm text-[var(--navy)]">
            Enroll in a training level to unlock the academy video library and learning links.
          </p>
          <Link href="/app/enroll" className="inline-flex text-sm font-semibold text-[#2b6cb0] hover:underline">
            Choose enrollment level →
          </Link>
        </Card>
      )}

      {(enrollment || isStaff) && materials.length === 0 && (
        <Card className="mt-6">
          <p className="text-sm text-[var(--steel)]">
            No materials published yet. Your admin will add video and document links here.
          </p>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {materials.map((m) => {
          const thumb = materialThumbnail(m.url, m.thumbnailUrl);
          const Icon = m.kind === "document" ? FileText : m.kind === "link" ? Link2 : Play;
          return (
            <a
              key={m.id}
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[var(--navy)]/8 transition hover:ring-[#2b6cb0]/40"
            >
              <div className="relative aspect-video bg-[var(--navy)]">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-full w-full object-cover opacity-90" />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/70">
                    <Icon className="h-10 w-10" />
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--navy)] opacity-90 group-hover:opacity-100">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[var(--navy)]">{m.title}</p>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-[var(--steel)]" />
                </div>
                {m.description && <p className="mt-1 text-sm text-[var(--steel)]">{m.description}</p>}
                <p className="mt-2 text-xs uppercase tracking-wide text-[var(--steel)]">
                  {m.kind}
                  {m.level ? ` · ${m.level.name}` : " · All levels"}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
