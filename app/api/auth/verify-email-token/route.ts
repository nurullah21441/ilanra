import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyResetToken } from "@/lib/password-reset";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false });

  const records = await prisma.emailVerificationToken.findMany({
    where: { expiresAt: { gt: new Date() } },
  });

  for (const record of records) {
    if (await verifyResetToken(token, record.tokenHash)) {
      return NextResponse.json({ valid: true });
    }
  }

  return NextResponse.json({ valid: false });
}
