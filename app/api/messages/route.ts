import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const conversations = await prisma.message.findMany({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      listing: { select: { id: true, title: true, images: { take: 1 } } },
    },
    orderBy: { createdAt: "desc" },
    distinct: ["senderId", "receiverId"],
  });

  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const { receiverId, content, listingId } = await req.json();
  if (!receiverId || !content) return NextResponse.json({ error: "Eksik veri" }, { status: 400 });

  const message = await prisma.message.create({
    data: { senderId: user.id, receiverId, content, listingId },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
