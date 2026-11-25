import Link from "next/link";
import { ExternalLink, Play, FileText, Link2 } from "lucide-react";
import { materialThumbnail } from "@/lib/learning-materials";

export type MaterialCard = {
  id: string;
  title: string;
  description: string;
  url: string;
  kind: string;
  thumbnailUrl: string | null;
  levelName?: string | null;
};

export function LearningMaterialsSection({
  materials,
  enrolled,
}: {
  materials: MaterialCard[];
  enrolled: boolean;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[var(--navy)]">Videos & Learning Materials</h2>
        <Link href="/app/videos" className="text-sm font-semibold text-[#2b6cb0] hover:underline">
          View all →
        </Link>
      </div>

      {!enrolled && (
        <p className="text-sm text-[var(--steel)]">
          Enroll in a level to unlock admin-curated videos and learning links.{" "}
          <Link href="/app/enroll" className="font-semibold text-[#2b6cb0] hover:underline">
            Enroll now
          </Link>
        </p>
      )}

      {enrolled && materials.length === 0 && (
        <p className="text-sm text-[var(--steel)]">
          Your academy videos will appear here once an admin publishes learning material links.
        </p>
      )}

      {enrolled && materials.length > 0 && (
        <ul className="space-y-3">
          {materials.slice(0, 4).map((m) => {
            const thumb = materialThumbnail(m.url, m.thumbnailUrl);
            const Icon = m.kind === "document" ? FileText : m.kind === "link" ? Link2 : Play;
            return (
              <li key={m.id}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-[var(--navy)]/8 p-2.5 transition hover:border-[#2b6cb0]/35"
                >
                  <span className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-[var(--navy)]">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-white/70">
                        <Icon className="h-5 w-5" />
                      </span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[var(--navy)]">
                        <Play className="h-3 w-3 fill-current" />
                      </span>
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[var(--navy)]">{m.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-[var(--steel)]">
                      {m.description || m.kind}
                      {m.levelName ? ` · ${m.levelName}` : ""}
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[var(--steel)]" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
