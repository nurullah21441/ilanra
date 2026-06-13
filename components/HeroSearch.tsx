"use client";
import Link from "next/link";

export default function HeroSearch() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto 2rem" }}>
      <form action="/ilanlar" method="GET" style={{
        display: "flex",
        background: "#fff",
        border: "1px solid #e8e8e5",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 4px 0 16px" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "#bbb", flexShrink: 0 }}>
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input name="q" placeholder="Ne arıyorsunuz? iPhone, Araba, Daire..." style={{
            flex: 1, padding: "14px 10px", border: "none", fontSize: 14.5,
            outline: "none", fontFamily: "inherit", background: "transparent", color: "#1a1a1a",
          }} />
        </div>
        <div style={{ width: 1, background: "#f0f0ee", margin: "10px 0" }} />
        <select name="city" style={{
          padding: "0 16px", border: "none", background: "transparent",
          fontSize: 13.5, color: "#666", fontFamily: "inherit", outline: "none", cursor: "pointer",
        }}>
          <option value="">📍 Tüm Türkiye</option>
          {["İstanbul","Ankara","İzmir","Mersin","Antalya","Bursa","Adana","Konya"].map(c => <option key={c}>{c}</option>)}
        </select>
        <button type="submit" style={{
          padding: "0 26px", border: "none",
          background: "linear-gradient(135deg, #e63946, #c1121f)",
          color: "#fff", fontSize: 14.5, fontWeight: 600,
          fontFamily: "inherit", cursor: "pointer",
        }}>Ara</button>
      </form>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
        {["iPhone", "Kiralık Daire", "Araba", "Bisiklet", "PlayStation"].map(term => (
          <Link key={term} href={`/ilanlar?q=${term}`} style={{
            padding: "5px 12px", borderRadius: 100,
            background: "#f5f5f3", border: "0.5px solid #e8e8e5",
            fontSize: 12.5, color: "#666", textDecoration: "none",
          }}>{term}</Link>
        ))}
      </div>
    </div>
  );
}
