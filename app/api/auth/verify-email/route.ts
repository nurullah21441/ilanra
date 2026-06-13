import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyResetToken } from "@/lib/password-reset";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const records = await prisma.emailVerificationToken.findMany({
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

  if (match.user.isVerified) {
    await prisma.emailVerificationToken.deleteMany({ where: { userId: match.userId } });
    return NextResponse.json({ success: true, alreadyVerified: true });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: match.userId }, data: { isVerified: true } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: match.userId } }),
  ]);

  return NextResponse.json({ success: true });
}
