import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const [totalListings, activeListings, featuredListings, totalUsers, totalMessages, pendingReports] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { isFeatured: true } }),
    prisma.user.count(),
    prisma.message.count(),
    prisma.listingReport.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({ totalListings, activeListings, featuredListings, totalUsers, totalMessages, pendingReports });
}
