import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const count = await prisma.message.count({
    where: { receiverId: user.id, isRead: false },
  });

  return NextResponse.json({ count });
}
