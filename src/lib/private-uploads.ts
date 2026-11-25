import { prisma } from "@/lib/db";

const MAX_BYTES = 900_000; // ~900KB — fits serverless request limits for DL photos

export async function savePrivateUpload(opts: {
  userId: string;
  kind: string;
  file: File;
}) {
  if (!opts.file || opts.file.size <= 0) {
    throw new Error("No file uploaded");
  }
  if (opts.file.size > MAX_BYTES) {
    throw new Error("File must be under 900KB");
  }
  const mimeType = opts.file.type || "application/octet-stream";
  const allowed = mimeType.startsWith("image/") || mimeType === "application/pdf";
  if (!allowed) {
    throw new Error("Upload a JPG, PNG, or PDF");
  }
  const buf = Buffer.from(await opts.file.arrayBuffer());
  return prisma.privateUpload.create({
    data: {
      userId: opts.userId,
      kind: opts.kind,
      fileName: opts.file.name || "upload",
      mimeType,
      dataBase64: buf.toString("base64"),
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
