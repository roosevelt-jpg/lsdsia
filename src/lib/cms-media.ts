import { prisma } from "@/lib/db";
import {
  cmsBlobPath,
  deleteBlobUrl,
  isBlobConfigured,
  putBlobFile,
} from "@/lib/blob-storage";

const MAX_MEDIA = 4_500_000;

export async function saveCmsMedia(opts: {
  key: string;
  label: string;
  file: File;
}) {
  if (!opts.key || !(opts.file instanceof File) || opts.file.size <= 0) {
    throw new Error("Media key and image file are required.");
  }
  if (!opts.file.type.startsWith("image/")) {
    throw new Error("Upload an image file.");
  }
  if (opts.file.size > MAX_MEDIA) {
    throw new Error("Image must be under 4.5MB.");
  }

  const fileName = opts.file.name || `${opts.key}.jpg`;
  const mimeType = opts.file.type;
  const buf = Buffer.from(await opts.file.arrayBuffer());

  const existing = await prisma.cmsMedia.findUnique({ where: { key: opts.key } });

  let blobUrl: string | null = null;
  let dataBase64 = "";

  if (isBlobConfigured()) {
    const stored = await putBlobFile({
      pathname: cmsBlobPath(opts.key, fileName),
      body: buf,
      contentType: mimeType,
      access: "public",
    });
    blobUrl = stored.url;
    if (existing?.blobUrl && existing.blobUrl !== blobUrl) {
      await deleteBlobUrl(existing.blobUrl);
    }
  } else {
    console.warn(
      "[cms-media] BLOB_READ_WRITE_TOKEN missing — storing CMS image in DB (dev fallback).",
    );
    dataBase64 = buf.toString("base64");
  }

  return prisma.cmsMedia.upsert({
    where: { key: opts.key },
    create: {
      key: opts.key,
      label: opts.label,
      fileName,
      mimeType,
      dataBase64,
      blobUrl,
      byteSize: buf.length,
    },
    update: {
      label: opts.label,
      fileName,
      mimeType,
      dataBase64,
      blobUrl,
      byteSize: buf.length,
    },
  });
}

/** Public URL for a CMS media row — Blob CDN when available. */
export function cmsMediaPublicUrl(media: { key: string; blobUrl?: string | null }) {
  if (media.blobUrl) return media.blobUrl;
  return `/api/cms-media/${media.key}`;
}
