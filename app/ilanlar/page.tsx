"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";

interface Listing {
  id: string; title: string; price: number; city: string; district?: string;
  isFeatured: boolean; createdAt: string; condition: string; description: string;
  images: { url: string }[]; category: { name: string; slug: string };
}

const cities = ["İstanbul","Ankara","İzmir","Mersin","Antalya","Bursa","Adana","Konya","Gaziantep","Kocaeli"];
const conditions = [{ value: "", label: "Tüm Durumlar" }, { value: "NEW", label: "Sıfır" }, { value: "LIKE_NEW", label: "Sıfır Gibi" }, { value: "USED", label: "İkinci El" }];

function IlanlarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const condition = searchParams.get("condition") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (condition) params.set("condition", condition);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("page", String(page));

    fetch(`/api/listings?${params}`)
      .then(r => r.json())
      .then(d => { setListings(d.listings || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  }, [q, category, city, condition, minPrice, maxPrice, page]);

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/ilanlar?${p.toString()}`);
  }

  const hasFilters = city || condition || minPrice || maxPrice;

  return (
    <>
      <Navbar />
      <div className="page-container">

        {/* Başlık satırı */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 700, letterSpacing: -0.3, marginBottom: 2 }}>
              {q ? `"${q}" için sonuçlar` : category ? "İlanlar" : "Tüm İlanlar"}
            </h1>
            <p style={{ fontSize: 13, color: "#999" }}>
              {loading ? "Aranıyor..." : `${total.toLocaleString("tr-TR")} ilan bulundu`}
            </p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px", borderRadius: 9,
            border: showFilters ? "1px solid var(--brand)" : "0.5px solid #e8e8e5",
            background: showFilters ? "var(--brand-soft)" : "#fff",
            color: showFilters ? "var(--brand)" : "#555",
            fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.15s",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Filtrele
            {hasFilters && <span style={{ background: "var(--brand)", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>!</span>}
          </button>
        </div>

        {/* FİLTRE PANELİ */}
        {showFilters && (
          <div style={{
            background: "#fff", borderRadius: 14, border: "0.5px solid #e8e8e5",
            padding: "1.25rem 1.5rem", marginBottom: "1.25rem",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12,
            animation: "fadeUp 0.18s ease",
          }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Şehir</label>
              <select value={city} onChange={e => setParam("city", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", background: "#fff", outline: "none" }}>
                <option value="">Tüm Türkiye</option>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Durum</label>
              <select value={condition} onChange={e => setParam("condition", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", background: "#fff", outline: "none" }}>
                {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Min Fiyat (₺)</label>
              <input type="number" value={minPrice} onChange={e => setParam("minPrice", e.target.value)}
                placeholder="0" min="0"
                style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Max Fiyat (₺)</label>
              <input type="number" value={maxPrice} onChange={e => setParam("maxPrice", e.target.value)}
                placeholder="∞" min="0"
                style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", outline: "none" }} />
            </div>
            {hasFilters && (
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button onClick={() => { ["city","condition","minPrice","maxPrice"].forEach(k => setParam(k, "")); }}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid #e8e8e5", background: "#fafaf8", fontSize: 13.5, color: "#999", cursor: "pointer", fontFamily: "inherit" }}>
                  Filtreleri temizle
                </button>
              </div>
            )}
          </div>
        )}

        {/* AKTİF FİLTRE BADGE'LERİ */}
        {hasFilters && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
            {city && <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12.5, color: "var(--brand)", fontWeight: 500 }}>📍 {city} <button onClick={() => setParam("city", "")} className="tap-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 4, fontSize: 16, lineHeight: 1, minWidth: 28, minHeight: 28 }}>×</button></span>}
            {condition && <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12.5, color: "var(--brand)", fontWeight: 500 }}>{conditions.find(c => c.value === condition)?.label} <button onClick={() => setParam("condition", "")} className="tap-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 4, fontSize: 16, lineHeight: 1, minWidth: 28, minHeight: 28 }}>×</button></span>}
            {minPrice && <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12.5, color: "var(--brand)", fontWeight: 500 }}>Min ₺{minPrice} <button onClick={() => setParam("minPrice", "")} className="tap-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 4, fontSize: 16, lineHeight: 1, minWidth: 28, minHeight: 28 }}>×</button></span>}
            {maxPrice && <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12.5, color: "var(--brand)", fontWeight: 500 }}>Max ₺{maxPrice} <button onClick={() => setParam("maxPrice", "")} className="tap-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 4, fontSize: 16, lineHeight: 1, minWidth: 28, minHeight: 28 }}>×</button></span>}
          </div>
        )}

        {/* GRID */}
        {loading ? (
          <div className="listing-grid" style={{ gap: 10 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 4, overflow: "hidden", border: "1px solid #e8e8e5" }}>
                <div className="skeleton" style={{ height: 128, borderRadius: 0 }} />
                <div style={{ padding: "10px 11px" }}>
                  <div className="skeleton" style={{ height: 16, marginBottom: 6, borderRadius: 3 }} />
                  <div className="skeleton" style={{ height: 12, width: "70%", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="listing-grid" style={{ gap: 10 }}>
              {listings.map(l => <ListingCard key={l.id} listing={l} variant="compact" />)}
            </div>

            {/* PAGİNASYON */}
            {pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: "2.5rem", flexWrap: "wrap" }}>
                <button onClick={() => setParam("page", String(page - 1))} disabled={page === 1} className="tap-btn"
                  style={{ width: 44, height: 44, borderRadius: 9, border: "0.5px solid #e8e8e5", background: "#fff", color: page === 1 ? "#ccc" : "#333", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 16 }}>
                  ‹
                </button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i;
                  return (
                    <button key={p} onClick={() => setParam("page", String(p))} className="tap-btn"
                      style={{ width: 44, height: 44, borderRadius: 9, border: p === page ? "none" : "0.5px solid #e8e8e5", background: p === page ? "var(--brand)" : "#fff", color: p === page ? "#fff" : "#333", fontSize: 13.5, fontWeight: p === page ? 700 : 400, cursor: "pointer" }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setParam("page", String(page + 1))} disabled={page === pages} className="tap-btn"
                  style={{ width: 44, height: 44, borderRadius: 9, border: "0.5px solid #e8e8e5", background: "#fff", color: page === pages ? "#ccc" : "#333", cursor: page === pages ? "not-allowed" : "pointer", fontSize: 16 }}>
                  ›
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "6rem 2rem", color: "#999" }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.6 }}>🔍</div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, color: "#444", marginBottom: 8 }}>Sonuç bulunamadı</h3>
            <p style={{ fontSize: 14, color: "#aaa", marginBottom: "1.5rem" }}>
              {q ? `"${q}" için ilan yok.` : "Bu kriterlere uygun ilan bulunamadı."}
            </p>
            <button onClick={() => router.push("/ilanlar")} style={{ padding: "10px 24px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Tüm ilanları gör
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function IlanlarPage() {
  return <Suspense fallback={<div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Yükleniyor...</div>}>
    <IlanlarContent />
  </Suspense>;
}
