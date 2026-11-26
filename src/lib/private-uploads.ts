import { prisma } from "@/lib/db";
import {
  isBlobConfigured,
  privateBlobPath,
  putBlobFile,
} from "@/lib/blob-storage";

/** Serverless request bodies stay under ~4.5MB; prefer Blob over DB base64. */
const MAX_BYTES = 4_500_000;

export async function savePrivateUpload(opts: {
  userId: string;
  kind: string;
  file: File;
}) {
  if (!opts.file || opts.file.size <= 0) {
    throw new Error("No file uploaded");
  }
  if (opts.file.size > MAX_BYTES) {
    throw new Error("File must be under 4.5MB");
  }
  const mimeType = opts.file.type || "application/octet-stream";
  const allowed = mimeType.startsWith("image/") || mimeType === "application/pdf";
  if (!allowed) {
    throw new Error("Upload a JPG, PNG, or PDF");
  }

  const fileName = opts.file.name || "upload";
  const buf = Buffer.from(await opts.file.arrayBuffer());

  let blobUrl: string | null = null;
  let dataBase64 = "";

  if (isBlobConfigured()) {
    const stored = await putBlobFile({
      pathname: privateBlobPath(opts.userId, opts.kind, fileName),
      body: buf,
      contentType: mimeType,
      access: "private",
    });
    blobUrl = stored.url;
  } else {
    console.warn(
      "[uploads] BLOB_READ_WRITE_TOKEN missing — storing private file in DB (dev fallback). Add a Vercel Blob store for production.",
    );
    dataBase64 = buf.toString("base64");
  }

  return prisma.privateUpload.create({
    data: {
      userId: opts.userId,
      kind: opts.kind,
      fileName,
      mimeType,
      dataBase64,
      blobUrl,
      byteSize: buf.length,
    },
  });
}

export async function getPrivateUploadForViewer(opts: {
  uploadId: string;
  viewerId: string;
  viewerRole: string;
}) {
  const upload = await prisma.privateUpload.findUnique({ where: { id: opts.uploadId } });
  if (!upload) return null;
  if (opts.viewerRole === "admin" || upload.userId === opts.viewerId) return upload;
  return null;
}
