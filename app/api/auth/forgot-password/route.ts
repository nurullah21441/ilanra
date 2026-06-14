import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { appBaseUrl, createResetToken, hashResetToken, resetExpiresAt } from "@/lib/password-reset";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "E-posta zorunlu" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
  });

  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = createResetToken();
    const tokenHash = await hashResetToken(token);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: resetExpiresAt(),
      },
    });

    const resetUrl = `${appBaseUrl()}/sifre-sifirla?token=${encodeURIComponent(token)}`;
    const mail = await sendPasswordResetEmail(user.email, resetUrl);

    if (!mail.ok) {
      return NextResponse.json({ error: "E-posta gönderilemedi. Lütfen tekrar deneyin." }, { status: 500 });
    }

    const body: Record<string, unknown> = {
      success: true,
      message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
    };
    if (process.env.NODE_ENV === "development" && mail.dev) {
      body.devResetUrl = resetUrl;
    }
    return NextResponse.json(body);
  }

  return NextResponse.json({
    success: true,
    message: "Bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.",
  });
}
