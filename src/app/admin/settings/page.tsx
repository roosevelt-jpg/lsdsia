import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const MAX_AVATAR_BYTES = 400_000;

async function saveProfile(formData: FormData) {
  "use server";
  const user = await requireUser(["admin"]);
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const removeAvatar = formData.get("removeAvatar") === "1";
  const file = formData.get("avatar");

  let avatarUrl: string | null | undefined = undefined;
  if (removeAvatar) {
    avatarUrl = null;
  } else if (file && file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      redirect("/admin/settings?error=" + encodeURIComponent("Avatar must be an image file."));
    }
    if (file.size > MAX_AVATAR_BYTES) {
      redirect("/admin/settings?error=" + encodeURIComponent("Avatar must be under 400KB."));
    }
    const buf = Buffer.from(await file.arrayBuffer());
    avatarUrl = `data:${file.type};base64,${buf.toString("base64")}`;
  }

  if (name) {
    await prisma.user.update({ where: { id: user.id }, data: { name } });
  }

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      phone,
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    },
    update: {
      phone,
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    },
  });

  redirect("/admin/settings?saved=1");
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await requireUser(["admin"]);
  const params = await searchParams;
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-[var(--steel)]">Manage your admin identity for Life Star Academy.</p>
      </div>

      {params.saved && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Profile saved.</p>
      )}
      {params.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{params.error}</p>
      )}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--navy)]/8 bg-gradient-to-r from-[var(--navy)] to-[var(--asphalt)] px-6 py-5 text-white">
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">Profile</p>
          <p className="mt-1 font-display text-2xl">{dbUser?.name}</p>
          <p className="text-sm text-white/70">{user.email}</p>
        </div>
        <form action={saveProfile} className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-4">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-20 w-20 rounded-full object-cover ring-2 ring-[var(--amber)]/50"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--navy)] text-xl font-semibold text-white">
                {(dbUser?.name || "A")
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase() ?? "")
                  .join("")}
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="avatar">Profile image</Label>
              <Input id="avatar" name="avatar" type="file" accept="image/*" />
              <p className="text-xs text-[var(--steel)]">JPG/PNG recommended, max 400KB.</p>
              {profile?.avatarUrl && (
                <label className="flex items-center gap-2 text-xs text-[var(--steel)]">
                  <input type="checkbox" name="removeAvatar" value="1" />
                  Remove current image
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Display name</Label>
            <Input id="name" name="name" defaultValue={dbUser?.name ?? ""} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>

          <Button type="submit">Save profile</Button>
        </form>
      </Card>
    </div>
  );
}
