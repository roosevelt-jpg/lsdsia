import { redirect } from "next/navigation";
import { Video } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listAllMaterialsAdmin, normalizeMaterialUrl } from "@/lib/learning-materials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function saveMaterial(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const url = normalizeMaterialUrl(String(formData.get("url") || ""));
  const kind = String(formData.get("kind") || "video").trim() || "video";
  const levelIdRaw = String(formData.get("levelId") || "").trim();
  const levelId = levelIdRaw || null;
  const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  const isActive = formData.get("isActive") === "1";

  if (!title || !url) {
    redirect("/admin/materials?error=" + encodeURIComponent("Title and URL are required."));
  }

  if (id) {
    await prisma.learningMaterial.update({
      where: { id },
      data: { title, description, url, kind, levelId, thumbnailUrl, sortOrder, isActive },
    });
  } else {
    await prisma.learningMaterial.create({
      data: { title, description, url, kind, levelId, thumbnailUrl, sortOrder, isActive },
    });
  }
  redirect("/admin/materials?ok=1");
}

async function deleteMaterial(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "").trim();
  if (id) await prisma.learningMaterial.delete({ where: { id } });
  redirect("/admin/materials?ok=1");
}

async function toggleMaterial(formData: FormData) {
  "use server";
  await requireUser(["admin"]);
  const id = String(formData.get("id") || "").trim();
  const isActive = formData.get("isActive") === "1";
  if (id) {
    await prisma.learningMaterial.update({ where: { id }, data: { isActive } });
  }
  redirect("/admin/materials?ok=1");
}

export default async function AdminMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string }>;
}) {
  await requireUser(["admin"]);
  const params = await searchParams;
  const [materials, levels] = await Promise.all([
    listAllMaterialsAdmin(),
    prisma.enrollmentLevel.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  const editing = params.edit ? materials.find((m) => m.id === params.edit) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="flex items-center gap-2 text-sm text-[var(--steel)]">
          <Video className="h-4 w-4 text-[var(--amber)]" />
          Add video and learning-material links for enrolled candidates. They appear on the student dashboard and Videos
          page.
        </p>
      </div>

      {params.ok && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Saved.</p>
      )}
      {params.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{params.error}</p>
      )}

      <Card className="space-y-4">
        <h2 className="font-display text-xl text-[var(--navy)]">
          {editing ? "Edit material" : "Add learning material"}
        </h2>
        <form action={saveMaterial} className="grid gap-3 sm:grid-cols-2">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[var(--steel)]">Title</label>
            <Input name="title" required defaultValue={editing?.title ?? ""} placeholder="e.g. Module 1 overview video" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[var(--steel)]">URL (YouTube, Vimeo, Drive, PDF…)</label>
            <Input
              name="url"
              required
              defaultValue={editing?.url ?? ""}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[var(--steel)]">Description</label>
            <textarea
              name="description"
              defaultValue={editing?.description ?? ""}
              className="min-h-20 w-full rounded-md border border-[var(--navy)]/15 px-3 py-2 text-sm outline-none ring-[var(--amber)] focus:ring-2"
              placeholder="Short note shown under the title"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--steel)]">Type</label>
            <select
              name="kind"
              defaultValue={editing?.kind ?? "video"}
              className="flex h-10 w-full rounded-md border border-[var(--navy)]/15 px-3 text-sm"
            >
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--steel)]">Enrollment level</label>
            <select
              name="levelId"
              defaultValue={editing?.levelId ?? ""}
              className="flex h-10 w-full rounded-md border border-[var(--navy)]/15 px-3 text-sm"
            >
              <option value="">All enrolled levels</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--steel)]">Sort order</label>
            <Input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--steel)]">Custom thumbnail URL (optional)</label>
            <Input name="thumbnailUrl" defaultValue={editing?.thumbnailUrl ?? ""} placeholder="Leave blank for YouTube auto" />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              value="1"
              defaultChecked={editing ? editing.isActive : true}
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className="text-sm text-[var(--navy)]">
              Visible to enrolled students
            </label>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit">{editing ? "Update material" : "Add material"}</Button>
            {editing && (
              <Button asChild variant="outline">
                <a href="/admin/materials">Cancel edit</a>
              </Button>
            )}
          </div>
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-[var(--navy)]">Published materials ({materials.length})</h2>
        {materials.length === 0 && (
          <p className="text-sm text-[var(--steel)]">No materials yet. Add a YouTube or document link above.</p>
        )}
        {materials.map((m) => (
          <Card key={m.id} className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--navy)]">
                {m.title}{" "}
                <span className="text-xs font-normal uppercase tracking-wide text-[var(--steel)]">
                  · {m.kind}
                  {!m.isActive ? " · hidden" : ""}
                </span>
              </p>
              <p className="mt-1 truncate text-sm text-[var(--steel)]">{m.url}</p>
              <p className="mt-1 text-xs text-[var(--steel)]">
                {m.level?.name || "All enrolled levels"} · sort {m.sortOrder}
              </p>
              {m.description && <p className="mt-2 text-sm text-[var(--navy)]">{m.description}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={m.url} target="_blank" rel="noreferrer">
                  Open
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={`/admin/materials?edit=${m.id}`}>Edit</a>
              </Button>
              <form action={toggleMaterial}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="isActive" value={m.isActive ? "0" : "1"} />
                <Button type="submit" size="sm" variant="outline">
                  {m.isActive ? "Hide" : "Show"}
                </Button>
              </form>
              <form action={deleteMaterial}>
                <input type="hidden" name="id" value={m.id} />
                <Button type="submit" size="sm" variant="outline">
                  Delete
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
