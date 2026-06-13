import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { categoryIdsForSlug } from "@/lib/category-seed";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  price: z.number().positive(),
  condition: z.enum(["NEW", "LIKE_NEW", "USED", "DEFECTIVE"]),
  categoryId: z.string(),
  city: z.string(),
  district: z.string().optional(),
  images: z.array(z.string()).max(10),
  attributes: z.record(z.string(), z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const district = searchParams.get("district");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const condition = searchParams.get("condition");
  const mine = searchParams.get("mine");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");

  const where: Record<string, unknown> = {};

  if (mine === "1" || mine === "true") {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
    where.userId = user.id;
    if (status && ["ACTIVE", "SOLD", "INACTIVE"].includes(status)) {
      where.status = status;
    }
  } else {
    where.status = "ACTIVE";
  }

  if (category) {
    const ids = await categoryIdsForSlug(category);
    if (ids) where.categoryId = { in: ids };
    else where.category = { slug: category };
  }
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (district) where.district = { contains: district, mode: "insensitive" };
  if (q) where.OR = [
    { title: { contains: q, mode: "insensitive" } },
    { description: { contains: q, mode: "insensitive" } },
  ];
  if (featured === "true") where.isFeatured = true;
  if (condition && ["NEW", "LIKE_NEW", "USED", "DEFECTIVE"].includes(condition)) {
    where.condition = condition;
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
  }

  const orderBy =
    sort === "price_asc" ? [{ price: "asc" as const }] :
    sort === "price_desc" ? [{ price: "desc" as const }] :
    sort === "date_asc" ? [{ createdAt: "asc" as const }] :
    [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }];

  const include = mine === "1" || mine === "true"
    ? {
        images: { orderBy: { order: "asc" as const }, take: 1 },
        category: { select: { name: true, slug: true } },
      }
    : {
        images: { orderBy: { order: "asc" as const }, take: 1 },
        category: { select: { name: true, slug: true } },
        user: { select: { id: true, name: true } },
      };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({ listings, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        condition: data.condition,
        categoryId: data.categoryId,
        city: data.city,
        district: data.district,
        attributes: data.attributes ?? undefined,
        userId: user.id,
        images: {
          create: data.images.map((url, i) => ({ url, order: i })),
        },
      },
      include: { images: true, category: true },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0].message }, { status: 422 });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
