import { del, get, put } from "@vercel/blob";

/** Vercel Blob read/write token — set via Vercel Storage → Blob store (auto-binds `BLOB_READ_WRITE_TOKEN`). */
export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function safeFileName(name: string) {
  const base = (name || "file").split(/[/\\]/).pop() || "file";
  return base.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 96) || "file";
}

export async function putBlobFile(opts: {
  pathname: string;
  body: Buffer | Blob | File | ArrayBuffer;
  contentType: string;
  access: "public" | "private";
  /** When true (default), avoid pathname collisions. */
  addRandomSuffix?: boolean;
  allowOverwrite?: boolean;
}): Promise<{ url: string; pathname: string; downloadUrl: string }> {
  if (!isBlobConfigured()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Create a Vercel Blob store (Storage → Blob) and bind it to this project, then redeploy.",
    );
  }

  const body =
    opts.body instanceof ArrayBuffer ? Buffer.from(opts.body) : opts.body;

  const blob = await put(opts.pathname, body, {
    access: opts.access,
    contentType: opts.contentType,
    addRandomSuffix: opts.addRandomSuffix ?? true,
    allowOverwrite: opts.allowOverwrite ?? false,
  });

  return { url: blob.url, pathname: blob.pathname, downloadUrl: blob.downloadUrl };
}

/** Build a store pathname for private candidate/admin uploads. */
export function privateBlobPath(userId: string, kind: string, fileName: string) {
  return `private/${userId}/${kind}/${safeFileName(fileName)}`;
}

/** Build a store pathname for public CMS marketing media. */
export function cmsBlobPath(key: string, fileName: string) {
  return `cms/${safeFileName(key)}/${safeFileName(fileName)}`;
}

export function avatarBlobPath(userId: string, fileName: string) {
  return `avatars/${userId}/${safeFileName(fileName)}`;
}

/** Stream a private blob for authorized API responses. */
export async function getPrivateBlobStream(urlOrPathname: string) {
  const result = await get(urlOrPathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return result;
}

/** Best-effort delete (ignore missing / misconfigured). */
export async function deleteBlobUrl(url: string | null | undefined) {
  if (!url || !isBlobConfigured()) return;
  try {
    await del(url);
  } catch (err) {
    console.warn("[blob] delete failed", url, err);
  }
}
