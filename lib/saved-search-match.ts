import type { SavedSearchFilters } from "@/lib/saved-search";
import { categoryIdsForSlug } from "@/lib/category-seed";

type ListingForMatch = {
  title: string;
  description: string;
  price: number;
  condition: string;
  city: string;
  district: string | null;
  categoryId: string;
  category: { slug: string };
};

export async function listingMatchesFilters(
  listing: ListingForMatch,
  filters: SavedSearchFilters,
): Promise<boolean> {
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const haystack = `${listing.title} ${listing.description}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (filters.category) {
    const ids = await categoryIdsForSlug(filters.category);
    const matchesCategory = ids
      ? ids.includes(listing.categoryId)
      : listing.category.slug === filters.category;
    if (!matchesCategory) return false;
  }

  if (filters.city && !listing.city.toLowerCase().includes(filters.city.toLowerCase())) {
    return false;
  }

  if (filters.district) {
    const district = listing.district?.toLowerCase() || "";
    if (!district.includes(filters.district.toLowerCase())) return false;
  }

  if (filters.condition && listing.condition !== filters.condition) {
    return false;
  }

  if (filters.minPrice) {
    const min = parseFloat(filters.minPrice);
    if (!Number.isNaN(min) && listing.price < min) return false;
  }

  if (filters.maxPrice) {
    const max = parseFloat(filters.maxPrice);
    if (!Number.isNaN(max) && listing.price > max) return false;
  }

  return true;
}
