"use client";
import { useEffect, useState } from "react";

interface Listing {
  id: string; title: string; price: number; city: string;
  images: { url: string }[]; category: { name: string; icon: string };
}

const DEMO = [
  { id: "1", title: "BMW 320i 2021 Otomatik", price: 1250000, city: "İstanbul", emoji: "🚗", color: "#EFF6FF" },
  { id: "2", title: "3+1 Satılık Daire 120m²", price: 3200000, city: "Ankara", emoji: "🏠", color: "#F0FDF4" },
  { id: "3", title: "iPhone 15 Pro 256GB", price: 52000, city: "İzmir", emoji: "📱", color: "#FEF3C7" },
  { id: "4", title: "PlayStation 5 + 2 Oyun", price: 18500, city: "Mersin", emoji: "🎮", color: "#F5F3FF" },
];

export default function HeroCards() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch("/api/listings?limit=4")
      .then(r => r.json())
      .then(d => { if (d.listings?.length) setListings(d.listings); });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % (listings.length || DEMO.length)), 3000);
    return () => clearInterval(t);
  }, [listings.length]);

  const items = listings.length ? listings : null;

  return (
    <div style={{ position: "relative", height: 380, width: "100%" }}>
      {/* Floating cards stack */}
      {DEMO.map((demo, i) => {
        const offset = (i - active + DEMO.length) % DEMO.length;
        const isTop = offset === 0;
        const isSecond = offset === 1;
        const isThird = offset === 2;

        if (offset > 2) return null;

        const real = items?.[i];

        return (
          <div key={demo.id} style={{
            position: "absolute", left: 0, right: 0,
            top: isTop ? 0 : isSecond ? 12 : 22,
            zIndex: isTop ? 30 : isSecond ? 20 : 10,
            transform: `scale(${isTop ? 1 : isSecond ? 0.97 : 0.94})`,
            opacity: isTop ? 1 : isSecond ? 0.85 : 0.65,
            transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
            animation: isTop ? "float 4s ease-in-out infinite" : "none",
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 16,
              border: "0.5px solid #e8e8e5",
              boxShadow: isTop ? "0 20px 60px rgba(0,0,0,0.12)" : "0 4px 16px rgba(0,0,0,0.06)",
              overflow: "hidden",
              display: "flex",
              height: 110,
            }}>
              {/* Image/Emoji */}
              <div style={{
                width: 120, flexShrink: 0,
                background: demo.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 42, position: "relative", overflow: "hidden",
              }}>
                {real?.images?.[0]?.url ? (
                  <img src={real.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span>{demo.emoji}</span>
                )}
                {isTop && (
                  <div style={{ position: "absolute", top: 8, left: 8, background: "#e63946", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 100 }}>
                    YENİ
                  </div>
                )}
              </div>
              {/* Content */}
              <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4, fontWeight: 500 }}>
                    {real?.category?.name || (i === 0 ? "Araçlar" : i === 1 ? "Emlak" : i === 2 ? "Elektronik" : "Oyun & Hobi")}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
                    {real?.title || demo.title}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#e63946" }}>
                    ₺{((real?.price || demo.price)).toLocaleString("tr-TR")}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#bbb", display: "flex", alignItems: "center", gap: 3 }}>
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M5 0C2.79 0 1 1.79 1 4c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" fill="currentColor"/></svg>
                    {real?.city || demo.city}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Dots */}
      <div style={{ position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {DEMO.map((_, i) => (
          <div key={i} onClick={() => setActive(i)} style={{
            width: i === active ? 20 : 6, height: 6, borderRadius: 3,
            background: i === active ? "#e63946" : "#e0e0de",
            cursor: "pointer", transition: "all 0.3s",
          }} />
        ))}
      </div>
    </div>
  );
}
