import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const { otherUserId, listingId } = await req.json();
  if (!otherUserId) return NextResponse.json({ error: "Kullanıcı gerekli" }, { status: 400 });

  await prisma.message.updateMany({
    where: {
      receiverId: user.id,
      senderId: otherUserId,
      isRead: false,
      listingId: listingId || null,
    },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
