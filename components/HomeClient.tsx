"use client";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export default function HomeClient({ featuredListings, listings, totalListings }: Props) {
  const regularListings = listings.filter(
    l => !featuredListings.some(f => f.id === l.id)
  );

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        {/* Üst başlık */}
        <section style={{
          background: "#fff",
          borderBottom: "0.5px solid #E8E8E5",
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            padding: "clamp(1.25rem, 4vw, 1.75rem) clamp(1rem, 3vw, 1.5rem) 1.5rem",
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            gap: 16, flexWrap: "wrap",
          }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "clamp(22px, 5vw, 34px)",
                fontWeight: 800, color: "#111",
                letterSpacing: "-0.03em", lineHeight: 1.1,
              }}>
                Güncel ilanlar
              </h1>
              <p style={{ fontSize: 14, color: "#999", marginTop: 6 }}>
                {totalListings > 0
                  ? `${totalListings.toLocaleString("tr-TR")} aktif ilan`
                  : "Henüz ilan yok — ilk sen ver!"}
              </p>
            </div>
            <Link href="/ilan-ver" className="hero-cta home-header-cta" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "11px 20px", borderRadius: 11, textDecoration: "none",
              fontWeight: 700, fontSize: 14, flexShrink: 0, width: "100%", maxWidth: 200, justifyContent: "center",
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
              İlan ver
            </Link>
          </div>
        </section>

        <div className="page-container" style={{ maxWidth: 1280, paddingBottom: "3rem" }}>
          {/* Öne çıkanlar */}
          {featuredListings.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <div style={{ width: 4, height: 22, background: "#E53935", borderRadius: 2 }} />
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: -0.3 }}>
                  Öne çıkanlar
                </h2>
              </div>
              <div className="listing-grid">
                {featuredListings.map(l => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}

          {/* Tüm ilanlar */}
          {regularListings.length > 0 ? (
            <section>
              {featuredListings.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                  <div style={{ width: 4, height: 22, background: "#E8E8E5", borderRadius: 2 }} />
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: -0.3 }}>
                    Son eklenenler
                  </h2>
                </div>
              )}
              <div className="listing-grid">
                {regularListings.map(l => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          ) : featuredListings.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "5rem 2rem",
              background: "#fff", borderRadius: 20,
              border: "0.5px solid #E8E8E5",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "linear-gradient(145deg, #FFE4E6, #FFF1F2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.25rem", fontSize: 32,
              }}>📭</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 8 }}>
                Henüz ilan yok
              </h3>
              <p style={{ fontSize: 14, color: "#999", marginBottom: "1.5rem", maxWidth: 320, margin: "0 auto 1.5rem" }}>
                Platformda ilk ilanı sen ver, diğerleri seni takip etsin.
              </p>
              <Link href="/ilan-ver" className="hero-cta" style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "13px 28px", borderRadius: 12, textDecoration: "none",
                fontWeight: 700, fontSize: 15,
              }}>
                İlk ilanı ver →
              </Link>
            </div>
          ) : null}

          {listings.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <Link href="/ilanlar" className="btn-ghost" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "12px 24px", borderRadius: 11, textDecoration: "none",
                fontSize: 14, fontWeight: 600,
              }}>
                Tüm ilanları gör →
              </Link>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </>
  );
}
