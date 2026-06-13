"use client";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import PostListingPromoCard from "@/components/PostListingPromoCard";
import { pickHeroSpotlight } from "@/lib/hero-spotlight";

interface ListingItem {
  id: string; title: string; price: number; city: string; district?: string | null;
  isFeatured: boolean; createdAt: string; condition: string; description?: string;
  images: { url: string }[]; category: { name: string; slug: string };
}

interface Props {
  featuredListings: ListingItem[];
  listings: ListingItem[];
  totalListings: number;
}

function injectPromoCards(items: ListingItem[], interval = 8) {
  const result: (ListingItem | "promo")[] = [];
  items.forEach((item, i) => {
    result.push(item);
    if ((i + 1) % interval === 0) result.push("promo");
  });
  if (!result.includes("promo") && items.length > 0) result.push("promo");
  return result;
}

export default function HomeClient({ featuredListings, listings, totalListings }: Props) {
  const regularListings = listings.filter(
    l => !featuredListings.some(f => f.id === l.id)
  );
  const gridItems = injectPromoCards(regularListings);
  const spotlightListings = pickHeroSpotlight(featuredListings, listings);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        <HomeHero totalListings={totalListings} spotlightListings={spotlightListings} />

        <div className="page-container" style={{ maxWidth: 1280, paddingBottom: "3rem" }}>
          {featuredListings.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 22, background: "var(--brand)", borderRadius: 2 }} />
                  <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: -0.3 }}>
                    Öne çıkanlar
                  </h2>
                </div>
                <Link href="/ilan-ver" className="hero-cta" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 9, textDecoration: "none",
                  fontWeight: 700, fontSize: 13,
                }}>
                  + Sen de ver
                </Link>
              </div>
              <div className="listing-grid listing-grid-vitrin">
                {featuredListings.map(l => (
                  <ListingCard key={l.id} listing={l} variant="vitrin" />
                ))}
                <PostListingPromoCard />
              </div>
            </section>
          )}

          {regularListings.length > 0 ? (
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 22, background: "#E8E8E5", borderRadius: 2 }} />
                  <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: -0.3 }}>
                    Son eklenenler
                  </h2>
                </div>
                <span style={{ fontSize: 13, color: "#999" }}>{totalListings.toLocaleString("tr-TR")} ilan</span>
              </div>

              <PostListingPromoCard variant="banner" />

              <div className="listing-grid">
                {gridItems.map((item, i) =>
                  item === "promo"
                    ? <PostListingPromoCard key={`promo-${i}`} />
                    : <ListingCard key={item.id} listing={item} variant="compact" />
                )}
              </div>
            </section>
          ) : featuredListings.length === 0 ? (
            <div className="promo-empty-state">
              <div className="promo-empty-icon">🚀</div>
              <h3 className="promo-empty-title">Platformu sen başlat</h3>
              <p className="promo-empty-text">
                İlk ilanı veren sensin — komisyonsuz, ücretsiz, 2 dakikada yayında.
              </p>
              <Link href="/ilan-ver" className="home-hero-cta-primary" style={{ animation: "none" }}>
                İlk ilanı ver →
              </Link>
            </div>
          ) : null}

          {listings.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Link href="/ilanlar" className="btn-ghost" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "12px 24px", borderRadius: 11, textDecoration: "none",
                fontSize: 14, fontWeight: 600,
              }}>
                Tüm ilanları gör →
              </Link>
              <p style={{ fontSize: 13, color: "#aaa" }}>
                Satacak bir şeyin mi var?{" "}
                <Link href="/ilan-ver" style={{ color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}>
                  Ücretsiz ilan ver
                </Link>
              </p>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </>
  );
}
