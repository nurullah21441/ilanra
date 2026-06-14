"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { loginPath } from "@/lib/auth-url";

interface Listing {
  id: string; title: string; price: number; city: string;
  status: string; isFeatured: boolean; createdAt: string; views: number;
  images: { url: string }[]; category: { name: string };
}

export default function IlanlarimPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.replace(loginPath("/ilanlarim")); return; }
      setUser(d.user);
      fetch("/api/listings?mine=1&limit=50")
        .then(r => r.json())
        .then(data => {
          setListings(data.listings || []);
        })
        .finally(() => setLoading(false));
    });
  }, [router]);

  async function deleteListing(id: string) {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) setListings(prev => prev.filter(l => l.id !== id));
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    }
  }

  const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
    ACTIVE:   { text: "Yayında", color: "#16a34a", bg: "#f0fdf4" },
    INACTIVE: { text: "Pasif",   color: "#888",    bg: "#f5f5f3" },
    SOLD:     { text: "Satıldı", color: "#2563EB", bg: "#eff6ff" },
  };

  return (
    <>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 900 }}>

        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>İlanlarım</h1>
            <p style={{ fontSize: 13.5, color: "#aaa" }}>{loading ? "Yükleniyor..." : `${listings.length} ilan`}</p>
          </div>
          <Link href="/ilan-ver" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 20px", background: "var(--brand)", color: "#fff",
            borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 14,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
            Yeni İlan Ver
          </Link>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📋</div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#333" }}>Henüz ilanın yok</h3>
            <p style={{ fontSize: 14, color: "#aaa", marginBottom: "1.5rem" }}>İlk ilanını ver, alıcıları bekle!</p>
            <Link href="/ilan-ver" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 24px", background: "var(--brand)", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
              + İlan ver
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {listings.map(listing => {
              const st = statusLabel[listing.status] || statusLabel.INACTIVE;
              return (
                <div key={listing.id} className="listing-row" style={{
                  background: "#fff", borderRadius: 14, border: "0.5px solid #E8E8E5",
                  padding: "1rem 1.25rem",
                  transition: "box-shadow .15s",
                }}>
                  {/* Resim */}
                  <div style={{ width: 72, height: 60, borderRadius: 10, overflow: "hidden", background: "#f5f5f3", flexShrink: 0 }}>
                    {listing.images[0] ? (
                      <img src={listing.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, opacity: .3 }}>📦</div>
                    )}
                  </div>

                  {/* Bilgi */}
                  <div className="listing-row-body">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span className="listing-row-title">{listing.title}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 100, background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{st.text}</span>
                      {listing.isFeatured && <span style={{ padding: "2px 8px", borderRadius: 100, background: "var(--brand-soft)", color: "var(--brand)", fontSize: 11, fontWeight: 700 }}>⭐ Öne Çıkan</span>}
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span className="price-text" style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Bricolage Grotesque', sans-serif" }}>₺{listing.price.toLocaleString("tr-TR")}</span>
                      <span style={{ fontSize: 12.5, color: "#bbb", display: "flex", alignItems: "center", gap: 3 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        {listing.views} görüntülenme
                      </span>
                      <span style={{ fontSize: 12.5, color: "#bbb" }}>📍 {listing.city}</span>
                      <span style={{ fontSize: 12.5, color: "#bbb" }}>{listing.category.name}</span>
                    </div>
                  </div>

                  {/* Butonlar */}
                  <div className="listing-row-actions">
                    {/* Düzenle */}
                    <Link href={`/ilan/${listing.id}/duzenle`} title="Düzenle" style={{
                      width: 36, height: 36, borderRadius: 9, border: "0.5px solid #E8E8E5",
                      background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      textDecoration: "none", color: "#555", transition: "all .15s",
                    }} className="menu-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </Link>

                    {/* Görüntüle */}
                    <Link href={`/ilan/${listing.id}`} title="Görüntüle" style={{
                      width: 36, height: 36, borderRadius: 9, border: "0.5px solid #E8E8E5",
                      background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      textDecoration: "none", color: "#555", transition: "all .15s",
                    }}
                      className="menu-item"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </Link>

                    {/* Aktif/Pasif */}
                    <button onClick={() => toggleStatus(listing.id, listing.status)} title={listing.status === "ACTIVE" ? "Pasife Al" : "Yayınla"}
                      style={{
                        width: 36, height: 36, borderRadius: 9,
                        border: listing.status === "ACTIVE" ? "0.5px solid #E8E8E5" : "0.5px solid #16a34a",
                        background: listing.status === "ACTIVE" ? "#fff" : "#f0fdf4",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: listing.status === "ACTIVE" ? "#888" : "#16a34a",
                        transition: "all .15s",
                      }}
                      className="menu-item"
                    >
                      {listing.status === "ACTIVE" ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      )}
                    </button>

                    {/* Sil */}
                    <button onClick={() => deleteListing(listing.id)} title="Sil"
                      style={{
                        width: 36, height: 36, borderRadius: 9,
                        border: "0.5px solid var(--brand-border)", background: "var(--brand-soft)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "var(--brand)", transition: "all .15s",
                      }}
                      className="menu-item"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
