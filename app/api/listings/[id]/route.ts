import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      user: { select: { id: true, name: true, phone: true, avatar: true, createdAt: true } },
    },
  });
  if (!listing) return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
  await prisma.listing.update({ where: { id }, data: { views: { increment: 1 } } });
  return NextResponse.json({ listing });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (listing.userId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const body = await req.json();
  const { images, ...rest } = body;

  // Temel alanları güncelle
  const updated = await prisma.listing.update({
    where: { id },
    data: rest,
  });

  // Resimler geldiyse güncelle
  if (images && Array.isArray(images)) {
    await prisma.listingImage.deleteMany({ where: { listingId: id } });
    if (images.length > 0) {
      await prisma.listingImage.createMany({
        data: images.map((url: string, i: number) => ({
          url,
          order: i,
          listingId: id,
        })),
      });
    }
  }

  const final = await prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ listing: final });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (listing.userId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
