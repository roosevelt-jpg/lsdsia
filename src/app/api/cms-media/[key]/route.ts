import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Public marketing media — intentionally public (homepage/program imagery). */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const media = await prisma.cmsMedia.findUnique({ where: { key } });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = Buffer.from(media.dataBase64, "base64");
  return new NextResponse(body, {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Disposition": `inline; filename="${media.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
