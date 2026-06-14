import Link from "next/link";
import ListingCard from "@/components/ListingCard";

interface SimilarListing {
  id: string;
  title: string;
  price: number;
  city: string;
  district?: string | null;
  isFeatured: boolean;
  createdAt: string;
  condition?: string;
  description?: string;
  images: { url: string }[];
  category: { name: string; slug: string };
}

export default function SimilarListings({ listings }: { listings: SimilarListing[] }) {
  if (!listings.length) return null;

  return (
    <section style={{ marginTop: "2.5rem" }}>
      <h2 style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: 18,
        fontWeight: 700,
        marginBottom: "1rem",
        color: "#111",
      }}>
        Benzer ilanlar
      </h2>
      <div className="listing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} variant="compact" />
        ))}
      </div>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Link
          href={`/kategori/${listings[0]?.category.slug}`}
          style={{ fontSize: 13.5, color: "var(--brand)", fontWeight: 600, textDecoration: "none" }}
        >
          Bu kategorideki tüm ilanlar →
        </Link>
      </div>
    </section>
  );
}
