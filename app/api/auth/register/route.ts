import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { issueAndSendVerificationEmail } from "@/lib/email-verification";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const data = schema.parse(requestBody);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 400 });
    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashed, phone: data.phone },
    });

    const mail = await issueAndSendVerificationEmail(user.id, user.email);

    const token = signToken({ userId: user.id, role: user.role });
    const body: Record<string, unknown> = {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: false },
      message: "Hesabın oluşturuldu. Hemen ilan verebilirsin; e-postanı doğrulamak isteğe bağlı.",
    };
    if (mail.dev && "verifyUrl" in mail) {
      body.devVerifyUrl = mail.verifyUrl;
    }

    const res = NextResponse.json(body);
    res.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
    return res;
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0].message }, { status: 422 });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
