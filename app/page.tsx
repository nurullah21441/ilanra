import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const listingInclude = {
    images: { take: 1, orderBy: { order: "asc" as const } },
    category: true,
    user: { select: { isVerified: true } },
  };

  const [featuredListings, listings, totalListings] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      include: listingInclude,
      orderBy: { featuredAt: "desc" },
      take: 4,
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: listingInclude,
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
  ]);

  const serialize = (l: typeof listings[number]) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  });

  return (
    <HomeClient
      featuredListings={featuredListings.map(serialize)}
      listings={listings.map(serialize)}
      totalListings={totalListings}
    />
  );
}
