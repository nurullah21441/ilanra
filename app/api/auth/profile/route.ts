import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  phone: z.string().max(20).optional().nullable(),
  showPhoneOnListings: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { phone: true, showPhoneOnListings: true },
    });
    if (!current) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

    const phone = data.phone === undefined
      ? current.phone
      : (data.phone?.trim() || null);

    let showPhoneOnListings = data.showPhoneOnListings ?? current.showPhoneOnListings;

    if (!phone) showPhoneOnListings = false;

    if (showPhoneOnListings && !phone) {
      return NextResponse.json(
        { error: "Telefonu ilanlarda göstermek için önce numara eklemeniz gerekir" },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { phone, showPhoneOnListings },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        showPhoneOnListings: true,
        role: true,
        avatar: true,
        isVerified: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
}
