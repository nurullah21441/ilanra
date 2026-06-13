import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const REPORT_REASONS = ["spam", "fake", "inappropriate", "scam", "other"] as const;

const schema = z.object({
  reason: z.enum(REPORT_REASONS),
  details: z.string().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: listingId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, userId: true } });
  if (!listing) return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
  if (listing.userId === user.id) {
    return NextResponse.json({ error: "Kendi ilanınızı şikayet edemezsiniz" }, { status: 400 });
  }

  try {
    const body = schema.parse(await req.json());
    const report = await prisma.listingReport.create({
      data: {
        listingId,
        reporterId: user.id,
        reason: body.reason,
        details: body.details?.trim() || null,
      },
    });
    return NextResponse.json({ success: true, reportId: report.id });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json({ error: "Bu ilanı zaten şikayet ettiniz" }, { status: 400 });
    }
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0].message }, { status: 422 });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
