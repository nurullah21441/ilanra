import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const city = new URL(req.url).searchParams.get("city");
  if (!city?.trim()) {
    return NextResponse.json({ districts: [] });
  }

  const rows = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      city: { equals: city.trim(), mode: "insensitive" },
      district: { not: null },
      NOT: { district: "" },
    },
    select: { district: true },
    distinct: ["district"],
    orderBy: { district: "asc" },
    take: 80,
  });

  const districts = rows
    .map((r) => r.district?.trim())
    .filter((d): d is string => !!d);

  return NextResponse.json({ districts });
}
