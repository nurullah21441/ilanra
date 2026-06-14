export interface HeroSpotlightListing {
  id: string;
  title: string;
  price: number;
  createdAt: string;
  isFeatured: boolean;
  images: { url: string }[];
  category: { name: string; slug: string };
}

/** Hero görselinde gösterilecek gerçek ilanları seçer — önce öne çıkanlar, farklı kategoriler, fotoğraflı öncelik. */
export function pickHeroSpotlight(
  featured: HeroSpotlightListing[],
  listings: HeroSpotlightListing[],
  max = 3,
): HeroSpotlightListing[] {
  const seen = new Set<string>();
  const merged: HeroSpotlightListing[] = [];
  for (const l of [...featured, ...listings]) {
    if (seen.has(l.id)) continue;
    seen.add(l.id);
    merged.push(l);
  }

  const withImage = merged.filter((l) => l.images[0]?.url);
  const pool = withImage.length >= max ? withImage : merged;

  const picked: HeroSpotlightListing[] = [];
  const categories = new Set<string>();

  for (const l of pool) {
    if (picked.length >= max) break;
    if (!categories.has(l.category.slug)) {
      picked.push(l);
      categories.add(l.category.slug);
    }
  }

  for (const l of pool) {
    if (picked.length >= max) break;
    if (!picked.some((p) => p.id === l.id)) picked.push(l);
  }

  return picked;
}

export function isFreshListing(date: string) {
  return Date.now() - new Date(date).getTime() < 48 * 60 * 60 * 1000;
}

export function formatListingPrice(price: number) {
  return new Intl.NumberFormat("tr-TR").format(price);
}
