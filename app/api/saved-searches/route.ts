import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const filterSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sort: z.string().optional(),
});

const createSchema = z.object({
  name: z.string().max(80).optional(),
  filters: filterSchema,
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const searches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ searches });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  try {
    const body = createSchema.parse(await req.json());
    const count = await prisma.savedSearch.count({ where: { userId: user.id } });
    if (count >= 20) {
      return NextResponse.json({ error: "En fazla 20 kayıtlı arama saklayabilirsiniz" }, { status: 400 });
    }

    const search = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: body.name?.trim() || null,
        filters: body.filters,
      },
    });

    return NextResponse.json({ search });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0].message }, { status: 422 });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
