import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const [listings, categories] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    }),
    prisma.category.findMany({
      select: { slug: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/ilanlar`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/ilan-ver`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/hakkimizda`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/iletisim`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryPages = categories.map((category) => ({
    url: `${base}/kategori/${category.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const listingPages = listings.map((listing) => ({
    url: `${base}/ilan/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...listingPages];
}
