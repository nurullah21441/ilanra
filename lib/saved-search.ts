export type SavedSearchFilters = {
  q?: string;
  category?: string;
  city?: string;
  district?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

export function filtersToSearchParams(filters: SavedSearchFilters): string {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.category) p.set("category", filters.category);
  if (filters.city) p.set("city", filters.city);
  if (filters.district) p.set("district", filters.district);
  if (filters.condition) p.set("condition", filters.condition);
  if (filters.minPrice) p.set("minPrice", filters.minPrice);
  if (filters.maxPrice) p.set("maxPrice", filters.maxPrice);
  if (filters.sort) p.set("sort", filters.sort);
  return p.toString();
}

export function describeSavedSearch(filters: SavedSearchFilters): string {
  const parts: string[] = [];
  if (filters.q) parts.push(`"${filters.q}"`);
  if (filters.category) parts.push(filters.category);
  if (filters.city) parts.push(filters.city);
  if (filters.district) parts.push(filters.district);
  if (filters.condition) parts.push(filters.condition);
  if (filters.minPrice || filters.maxPrice) {
    parts.push(`${filters.minPrice || "0"}–${filters.maxPrice || "∞"} ₺`);
  }
  return parts.length ? parts.join(" · ") : "Tüm ilanlar";
}
