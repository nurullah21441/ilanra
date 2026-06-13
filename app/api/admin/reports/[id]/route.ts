import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["REVIEWED", "DISMISSED"]),
  deactivateListing: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { id } = await params;
  const report = await prisma.listingReport.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!report) return NextResponse.json({ error: "Şikayet bulunamadı" }, { status: 404 });

  try {
    const body = schema.parse(await req.json());

    await prisma.listingReport.update({
      where: { id },
      data: { status: body.status },
    });

    if (body.deactivateListing && report.listing.status === "ACTIVE") {
      await prisma.listing.update({
        where: { id: report.listingId },
        data: { status: "INACTIVE" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0].message }, { status: 422 });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
