import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status") || "PENDING";
  const where = status === "all" ? {} : { status: status as "PENDING" | "REVIEWED" | "DISMISSED" };

  const reports = await prisma.listingReport.findMany({
    where,
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          status: true,
          user: { select: { name: true, email: true } },
        },
      },
      reporter: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ reports });
}
