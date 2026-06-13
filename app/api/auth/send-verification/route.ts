import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueAndSendVerificationEmail } from "@/lib/email-verification";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isVerified: true, email: true },
  });

  if (!dbUser) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (dbUser.isVerified) {
    return NextResponse.json({ success: true, message: "E-posta zaten doğrulanmış." });
  }

  const mail = await issueAndSendVerificationEmail(user.id, dbUser.email);
  if (!mail.ok) {
    return NextResponse.json({ error: "E-posta gönderilemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }

  const body: Record<string, unknown> = {
    success: true,
    message: "Doğrulama bağlantısı e-posta adresinize gönderildi.",
  };
  if (process.env.NODE_ENV === "development" && mail.dev && "verifyUrl" in mail) {
    body.devVerifyUrl = mail.verifyUrl;
  }
  return NextResponse.json(body);
}
