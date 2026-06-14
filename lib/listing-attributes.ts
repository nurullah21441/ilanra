export type ListingAttributes = Record<string, string>;

/** Form alanlarından açıklama metni (arama + geriye uyumluluk) */
export function buildDescriptionFromFields(
  fields: { key: string; label: string; suffix?: string }[],
  values: ListingAttributes,
  fallback: string,
): string {
  const lines = fields
    .filter((f) => values[f.key]?.trim())
    .map((f) => `${f.label}: ${values[f.key]}${f.suffix ? ` ${f.suffix}` : ""}`);
  return lines.length ? lines.join("\n") : fallback;
}

/** JSON attributes → ListingCard badge specs (Türkçe etiket anahtarları) */
export function attributesToSpecs(slug: string, attrs: ListingAttributes): Record<string, string> {
  const s: Record<string, string> = {};
  const set = (key: string, val?: string) => {
    if (val?.trim()) s[key] = val.trim();
  };

  if (slug === "araclar") {
    set("marka", attrs.brand);
    set("model", attrs.model);
    set("yıl", attrs.year);
    set("kilometre", attrs.km ? `${attrs.km} km` : "");
    set("yakıt", attrs.fuel);
    set("vites", attrs.gear);
  } else if (slug === "emlak") {
    set("ilan türü", attrs.listingType);
    set("emlak türü", attrs.propertyType);
    set("metrekare", attrs.sqm);
    set("oda sayısı", attrs.rooms);
    set("bina yaşı", attrs.buildingAge);
    set("ısıtma", attrs.heating);
    set("imar durumu", attrs.zoning);
  } else if (slug === "elektronik") {
    set("marka", attrs.brand);
    set("model", attrs.model);
    set("depolama", attrs.storage);
    set("garanti durumu", attrs.warranty);
  } else if (slug === "giyim") {
    set("cinsiyet", attrs.gender);
    set("marka", attrs.brand);
    set("beden", attrs.size);
    set("renk", attrs.color);
  } else if (slug === "ev-yasam") {
    set("ürün tipi", attrs.itemType);
    set("marka", attrs.brand);
    set("renk / malzeme", attrs.color);
  } else if (slug === "oyun-hobi") {
    set("platform", attrs.platform);
    set("tür", attrs.itemType);
    set("marka", attrs.brand);
  } else if (slug === "bisiklet") {
    set("bisiklet türü", attrs.bikeType);
    set("marka", attrs.brand);
    set("jant boyu", attrs.wheelSize);
    if (attrs.gears) set("vites", `${attrs.gears} vites`);
  } else if (slug === "spor") {
    set("spor dalı", attrs.sport);
    set("ürün tipi", attrs.itemType);
    set("marka", attrs.brand);
    set("beden", attrs.size);
  } else if (slug === "kitap-muzik") {
    set("tür", attrs.mediaType);
    set("yazar / sanatçı", attrs.author);
    set("başlık", attrs.name);
  } else {
    Object.entries(attrs).forEach(([k, v]) => {
      if (v?.trim()) s[k] = v.trim();
    });
  }

  return s;
}

export function parseAttributesJson(raw: unknown): ListingAttributes | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: ListingAttributes = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return Object.keys(out).length ? out : null;
}

/** Detay sayfası için okunabilir özellik listesi */
export function formatAttributesForDetail(
  slug: string,
  attrs: ListingAttributes,
): { label: string; value: string }[] {
  const LABELS: Record<string, string> = {
    brand: "Marka", model: "Model", year: "Yıl", km: "Kilometre", fuel: "Yakıt", gear: "Vites", color: "Renk",
    listingType: "İlan türü", propertyType: "Emlak türü", sqm: "Metrekare", rooms: "Oda sayısı",
    buildingAge: "Bina yaşı", floor: "Kat", heating: "Isıtma", zoning: "İmar durumu",
    storage: "Depolama", warranty: "Garanti", gender: "Cinsiyet", size: "Beden",
    itemType: "Ürün tipi", platform: "Platform", bikeType: "Bisiklet türü",
    wheelSize: "Jant", gears: "Vites", sport: "Spor", mediaType: "Tür", author: "Yazar / Sanatçı",
    name: "Başlık", subject: "Konu", level: "Seviye", format: "Format",
  };

  return Object.entries(attrs)
    .filter(([, v]) => v?.trim())
    .map(([key, value]) => ({
      label: LABELS[key] || key,
      value: key === "km" && !value.includes("km") ? `${value} km` : value,
    }));
}
