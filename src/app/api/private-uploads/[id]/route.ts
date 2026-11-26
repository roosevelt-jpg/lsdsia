import { NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { getPrivateBlobStream } from "@/lib/blob-storage";
import { getPrivateUploadForViewer } from "@/lib/private-uploads";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAuthorizedUser(["candidate", "coach", "admin"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const upload = await getPrivateUploadForViewer({
    uploadId: id,
    viewerId: session.id,
    viewerRole: session.role,
  });
  if (!upload) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headers = {
    "Content-Type": upload.mimeType,
    "Content-Disposition": `inline; filename="${upload.fileName.replace(/"/g, "")}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };

  if (upload.blobUrl) {
    const blob = await getPrivateBlobStream(upload.blobUrl);
    if (!blob) return NextResponse.json({ error: "Blob missing" }, { status: 404 });
    return new NextResponse(blob.stream, { headers });
  }

  if (!upload.dataBase64) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = Buffer.from(upload.dataBase64, "base64");
  return new NextResponse(body, { headers });
}
