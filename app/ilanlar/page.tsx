"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import PostListingPromoCard from "@/components/PostListingPromoCard";
import { CITIES, SORT_OPTIONS, PAGE_SIZE } from "@/lib/cities";
import { loginPath } from "@/lib/auth-url";
import type { SavedSearchFilters } from "@/lib/saved-search";

interface Listing {
  id: string; title: string; price: number; city: string; district?: string;
  isFeatured: boolean; createdAt: string; condition: string; description: string;
  images: { url: string }[]; category: { name: string; slug: string };
}

const conditions = [
  { value: "", label: "Tüm Durumlar" },
  { value: "NEW", label: "Sıfır" },
  { value: "LIKE_NEW", label: "Sıfır Gibi" },
  { value: "USED", label: "İkinci El" },
];

function IlanlarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const district = searchParams.get("district") || "";
  const condition = searchParams.get("condition") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    if (!city) {
      setDistricts([]);
      return;
    }
    fetch(`/api/listings/districts?city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((d) => setDistricts(d.districts || []))
      .catch(() => setDistricts([]));
  }, [city]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (district) params.set("district", district);
    if (condition) params.set("condition", condition);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));

    fetch(`/api/listings?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setListings(d.listings || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [q, category, city, district, condition, minPrice, maxPrice, sort, page]);

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    if (key === "city") p.delete("district");
    p.delete("page");
    router.push(`/ilanlar?${p.toString()}`);
  }

  const hasFilters = city || district || condition || minPrice || maxPrice || q || category;
  const rangeFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(page * PAGE_SIZE, total);

  async function saveSearch() {
    setSaveMsg("");
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user) {
      router.push(loginPath(`/ilanlar?${searchParams.toString()}`));
      return;
    }

    const filters: SavedSearchFilters = {};
    if (q) filters.q = q;
    if (category) filters.category = category;
    if (city) filters.city = city;
    if (district) filters.district = district;
    if (condition) filters.condition = condition;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (sort) filters.sort = sort;

    setSaveLoading(true);
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters }),
    });
    const data = await res.json();
    setSaveLoading(false);

    if (!res.ok) {
      setSaveMsg(data.error || "Kaydedilemedi");
      return;
    }
    setSaveMsg(data.message || "Arama kaydedildi. Yeni ilan gelince e-posta ile haber vereceğiz.");
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="toolbar-row" style={{ marginBottom: "1.25rem" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 700, letterSpacing: -0.3, marginBottom: 2 }}>
              {q ? `"${q}" için sonuçlar` : category ? "İlanlar" : "Tüm İlanlar"}
            </h1>
            <p style={{ fontSize: 13, color: "#999" }}>
              {loading
                ? "Aranıyor..."
                : total === 0
                  ? "İlan bulunamadı"
                  : `${total.toLocaleString("tr-TR")} ilan · ${rangeFrom}–${rangeTo} gösteriliyor`}
            </p>
          </div>
          <div className="toolbar-actions">
            <Link href="/ilan-ver" className="hero-cta" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 9, textDecoration: "none",
              fontWeight: 700, fontSize: 13, whiteSpace: "nowrap",
            }}>
              + İlan ver
            </Link>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              aria-label="Sıralama"
              style={{
                padding: "8px 12px",
                borderRadius: 9,
                border: "0.5px solid #e8e8e5",
                background: "#fff",
                fontSize: 13.5,
                fontFamily: "inherit",
                color: "#444",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value || "default"} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={saveSearch}
              disabled={saveLoading || !hasFilters}
              title={hasFilters ? "Bu aramayı kaydet" : "Kaydetmek için filtre veya arama kullanın"}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 9,
                border: "0.5px solid #e8e8e5",
                background: "#fff",
                color: hasFilters ? "#555" : "#bbb",
                fontSize: 13.5, fontWeight: 500,
                cursor: hasFilters && !saveLoading ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                opacity: saveLoading ? 0.7 : 1,
              }}
            >
              {saveLoading ? "..." : "★ Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 9,
                border: showFilters ? "1px solid var(--brand)" : "0.5px solid #e8e8e5",
                background: showFilters ? "var(--brand-soft)" : "#fff",
                color: showFilters ? "var(--brand)" : "#555",
                fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Filtrele
              {hasFilters && (
                <span style={{ background: "var(--brand)", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>!</span>
              )}
            </button>
          </div>
        </div>

        {saveMsg && (
          <p style={{ fontSize: 13, color: saveMsg.includes("kaydedildi") ? "#15803d" : "#dc2626", marginBottom: "1rem" }}>{saveMsg}</p>
        )}

        {showFilters && (
          <div className="filters-grid" style={{
            background: "#fff", borderRadius: 14, border: "0.5px solid #e8e8e5",
            padding: "1.25rem 1.5rem", marginBottom: "1.25rem",
          }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Şehir</label>
              <select
                value={city}
                onChange={(e) => setParam("city", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", background: "#fff", outline: "none" }}
              >
                <option value="">Tüm Türkiye</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>İlçe</label>
              {city && districts.length > 0 ? (
                <select
                  value={district}
                  onChange={(e) => setParam("district", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", background: "#fff", outline: "none" }}
                >
                  <option value="">Tüm ilçeler</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setParam("district", e.target.value)}
                  placeholder={city ? "İlçe yazın..." : "Önce şehir seçin"}
                  disabled={!city}
                  style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", outline: "none", opacity: city ? 1 : 0.6 }}
                />
              )}
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Durum</label>
              <select
                value={condition}
                onChange={(e) => setParam("condition", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", background: "#fff", outline: "none" }}
              >
                {conditions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Min Fiyat (₺)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setParam("minPrice", e.target.value)}
                placeholder="0"
                min="0"
                style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Max Fiyat (₺)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setParam("maxPrice", e.target.value)}
                placeholder="∞"
                min="0"
                style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e8e8e5", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", outline: "none" }}
              />
            </div>
            {hasFilters && (
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => { ["city", "district", "condition", "minPrice", "maxPrice"].forEach((k) => setParam(k, "")); }}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid #e8e8e5", background: "#fafaf8", fontSize: 13.5, color: "#999", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Filtreleri temizle
                </button>
              </div>
            )}
          </div>
        )}

        {hasFilters && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
            {city && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12.5, color: "var(--brand)", fontWeight: 500 }}>
                📍 {city}
                <button type="button" onClick={() => setParam("city", "")} className="tap-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 4, fontSize: 16, lineHeight: 1, minWidth: 28, minHeight: 28 }}>×</button>
              </span>
            )}
            {district && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12.5, color: "var(--brand)", fontWeight: 500 }}>
                {district}
                <button type="button" onClick={() => setParam("district", "")} className="tap-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 4, fontSize: 16, lineHeight: 1, minWidth: 28, minHeight: 28 }}>×</button>
              </span>
            )}
            {condition && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12.5, color: "var(--brand)", fontWeight: 500 }}>
                {conditions.find((c) => c.value === condition)?.label}
                <button type="button" onClick={() => setParam("condition", "")} className="tap-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 4, fontSize: 16, lineHeight: 1, minWidth: 28, minHeight: 28 }}>×</button>
              </span>
            )}
            {minPrice && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12.5, color: "var(--brand)", fontWeight: 500 }}>
                Min ₺{minPrice}
                <button type="button" onClick={() => setParam("minPrice", "")} className="tap-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 4, fontSize: 16, lineHeight: 1, minWidth: 28, minHeight: 28 }}>×</button>
              </span>
            )}
            {maxPrice && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--brand-soft)", border: "0.5px solid var(--brand-border)", fontSize: 12.5, color: "var(--brand)", fontWeight: 500 }}>
                Max ₺{maxPrice}
                <button type="button" onClick={() => setParam("maxPrice", "")} className="tap-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 4, fontSize: 16, lineHeight: 1, minWidth: 28, minHeight: 28 }}>×</button>
              </span>
            )}
          </div>
        )}

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
            <PostListingPromoCard variant="banner" />
            <div className="listing-grid" style={{ gap: 10 }}>
              {listings.flatMap((l, i) => {
                const cards = [<ListingCard key={l.id} listing={l} variant="compact" />];
                if ((i + 1) % 8 === 0) cards.push(<PostListingPromoCard key={`promo-${l.id}`} />);
                return cards;
              })}
              {listings.length < 8 && <PostListingPromoCard key="promo-end" />}
            </div>

            {pages > 1 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: "2.5rem" }}>
                <p style={{ fontSize: 13, color: "#999" }}>
                  Sayfa {page} / {pages}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => setParam("page", String(page - 1))} disabled={page === 1} className="tap-btn"
                    style={{ width: 44, height: 44, borderRadius: 9, border: "0.5px solid #e8e8e5", background: "#fff", color: page === 1 ? "#ccc" : "#333", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 16 }}>
                    ‹
                  </button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i;
                    return (
                      <button key={p} type="button" onClick={() => setParam("page", String(p))} className="tap-btn"
                        style={{ width: 44, height: 44, borderRadius: 9, border: p === page ? "none" : "0.5px solid #e8e8e5", background: p === page ? "var(--brand)" : "#fff", color: p === page ? "#fff" : "#333", fontSize: 13.5, fontWeight: p === page ? 700 : 400, cursor: "pointer" }}>
                        {p}
                      </button>
                    );
                  })}
                  <button type="button" onClick={() => setParam("page", String(page + 1))} disabled={page === pages} className="tap-btn"
                    style={{ width: 44, height: 44, borderRadius: 9, border: "0.5px solid #e8e8e5", background: "#fff", color: page === pages ? "#ccc" : "#333", cursor: page === pages ? "not-allowed" : "pointer", fontSize: 16 }}>
                    ›
                  </button>
                </div>
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
            <button type="button" onClick={() => router.push("/ilanlar")} style={{ padding: "10px 24px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Tüm ilanları gör
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function IlanlarPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Yükleniyor...</div>}>
      <IlanlarContent />
    </Suspense>
  );
}
