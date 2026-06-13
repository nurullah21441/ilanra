import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const { id } = await params;
  const search = await prisma.savedSearch.findUnique({ where: { id } });
  if (!search || search.userId !== user.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  await prisma.savedSearch.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
