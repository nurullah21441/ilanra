import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyResetToken } from "@/lib/password-reset";

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
  }

  const records = await prisma.passwordResetToken.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  let match: (typeof records)[number] | null = null;
  for (const record of records) {
    if (await verifyResetToken(token, record.tokenHash)) {
      match = record;
      break;
    }
  }

  if (!match) {
    return NextResponse.json({ error: "Bağlantı geçersiz veya süresi dolmuş" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: match.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: match.userId } }),
  ]);

  return NextResponse.json({ success: true });
}
