import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, newPassword } = await req.json();
  if (!email || !newPassword) return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: "Sifre en az 6 karakter olmali" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Kullanici bulunamadi" }, { status: 404 });
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { email }, data: { password: hashed } });
  return NextResponse.json({ success: true });
}
