import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export function listingMetadata(input: {
  title: string;
  description: string;
  price: number;
  city: string;
  imageUrl?: string | null;
}): Metadata {
  const formattedPrice = new Intl.NumberFormat("tr-TR").format(input.price);
  const description = input.description.trim().slice(0, 155) + (input.description.length > 155 ? "..." : "");

  return {
    title: `${input.title} - ₺${formattedPrice}`,
    description: `${input.city} · ₺${formattedPrice} · ${description}`,
    openGraph: {
      title: input.title,
      description,
      type: "website",
      images: input.imageUrl ? [{ url: absoluteUrl(input.imageUrl) }] : undefined,
    },
  };
}

export function listingJsonLd(input: {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  imageUrl?: string | null;
  categoryName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.title,
    description: input.description,
    category: input.categoryName,
    offers: {
      "@type": "Offer",
      price: input.price,
      priceCurrency: "TRY",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/ilan/${input.id}`),
    },
    image: input.imageUrl ? absoluteUrl(input.imageUrl) : undefined,
    areaServed: input.city,
  };
}
