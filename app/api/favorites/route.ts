import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");

  const user = await getCurrentUser();
  if (!user) {
    if (listingId) return NextResponse.json({ favorited: false });
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  if (listingId) {
    const exists = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: user.id, listingId } },
    });
    return NextResponse.json({ favorited: !!exists });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: { images: { take: 1, orderBy: { order: "asc" } }, category: true, user: { select: { isVerified: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  const { listingId } = await req.json();
  const exists = await prisma.favorite.findUnique({ where: { userId_listingId: { userId: user.id, listingId } } });
  if (exists) {
    await prisma.favorite.delete({ where: { userId_listingId: { userId: user.id, listingId } } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId: user.id, listingId } });
  return NextResponse.json({ favorited: true });
}
