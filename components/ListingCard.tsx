"use client";
import Link from "next/link";
import { useState } from "react";

interface Listing {
  id: string; title: string; price: number; city: string; district?: string | null;
  isFeatured: boolean; createdAt: string; condition?: string; description?: string;
  images: { url: string }[]; category: { name: string; slug: string };
}

const conditionLabel: Record<string, { text: string; color: string; bg: string }> = {
  NEW:      { text: "Sıfır",         color: "#16a34a", bg: "#f0fdf4" },
  LIKE_NEW: { text: "Az Kullanıldı", color: "#0284c7", bg: "#f0f9ff" },
  USED:     { text: "2. El",         color: "#555",    bg: "#f5f5f3" },
  DEFECTIVE:{ text: "Hasarlı",       color: "#dc2626", bg: "var(--brand-soft)" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + "dk";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "sa";
  const days = Math.floor(hrs / 24);
  return days < 7 ? days + "g" : new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function parseSpecs(desc: string): Record<string, string> {
  const s: Record<string, string> = {};
  for (const line of desc.split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    s[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  return s;
}

function getBadges(slug: string, specs: Record<string, string>) {
  const b: { label: string; bg: string; color: string }[] = [];
  const p = (label: string, bg: string, color: string) => { if (label) b.push({ label, bg, color }); };
  if (slug === "araclar") {
    const km = (specs["kilometre"] || specs["km"] || "").replace(" km", "");
    p(specs["yil"] || specs["y\u0131l"], "#F5F5F3", "#444");
    if (km) p(parseInt(km).toLocaleString("tr-TR") + " km", "#F5F5F3", "#444");
    p(specs["yak\u0131t"] || specs["yakit"], "#EFF6FF", "#2563EB");
    p(specs["vites"], "#F5F3FF", "#7C3AED");
  } else if (slug === "bisiklet") {
    p(specs["bisiklet t\u00fcr\u00fc"] || specs["t\u00fcr"], "#F7FEE7", "#65A30D");
    p(specs["marka"], "#F5F5F3", "#444");
    p(specs["jant boyu"] || specs["jant"], "#EFF6FF", "#2563EB");
    const g = specs["vites"]; if (g) p(g + " vites", "#F5F3FF", "#7C3AED");
  } else if (slug === "elektronik") {
    p(specs["marka"], "#F5F3FF", "#7C3AED");
    p(specs["model"], "#F5F5F3", "#444");
    p(specs["depolama"], "#EFF6FF", "#2563EB");
    p(specs["garanti durumu"] || specs["garanti"], "#F0FDF4", "#16a34a");
  } else if (slug === "emlak") {
    p(specs["ilan t\u00fcr\u00fc"], "#F0FDF4", "#16a34a");
    p(specs["emlak t\u00fcr\u00fc"], "#F5F5F3", "#444");
    p(specs["oda say\u0131s\u0131"], "#EFF6FF", "#2563EB");
    const sqm = specs["metrekare"]; if (sqm) p(sqm + " m2", "#F5F5F3", "#555");
  } else if (slug === "giyim") {
    p(specs["cinsiyet"], "#FFF1F2", "#E11D48");
    p(specs["marka"], "#F5F5F3", "#444");
    p(specs["beden"], "#EFF6FF", "#2563EB");
    p(specs["renk"], "#F5F5F3", "#555");
  } else if (slug === "ev-yasam") {
    p(specs["\u00fcr\u00fcn tipi"] || specs["kategori"], "#FFF7ED", "#EA580C");
    p(specs["marka"], "#F5F5F3", "#444");
    p(specs["renk / malzeme"] || specs["renk"], "#F5F5F3", "#555");
  } else if (slug === "oyun-hobi") {
    p(specs["platform"], "#F0F9FF", "#0284C7");
    p(specs["t\u00fcr"], "#F5F3FF", "#7C3AED");
    p(specs["marka"], "#F5F5F3", "#444");
  } else if (slug === "spor") {
    p(specs["spor dal\u0131"], "#FFFBEB", "#D97706");
    p(specs["\u00fcr\u00fcn tipi"], "#F5F5F3", "#444");
    p(specs["marka"], "#F5F5F3", "#555");
  } else if (slug === "kitap-muzik") {
    p(specs["t\u00fcr"], "#FDF4FF", "#9333EA");
    p(specs["yazar / sanat\u00e7\u0131"] || specs["yazar"], "#F5F5F3", "#555");
  }
  return b.filter(x => x.label);
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const [imgError, setImgError] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const img = listing.images[0]?.url;
  const formatted = new Intl.NumberFormat("tr-TR").format(listing.price);
  const cond = listing.condition ? conditionLabel[listing.condition] : null;
  const specs = listing.description ? parseSpecs(listing.description) : {};
  const badges = getBadges(listing.category.slug, specs);

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavorited(f => !f);
    await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: listing.id }) }).catch(() => {});
  }

  return (
    <Link href={"/ilan/" + listing.id} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
      <article className="listing-card" style={{ background: "#fff", border: listing.isFeatured ? "1.5px solid var(--brand)" : "0.5px solid #E8E8E5", borderRadius: 16, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: 185, background: "#f5f5f3", flexShrink: 0, overflow: "hidden" }}>
          {img && !imgError ? (
            <img src={img} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }} onError={() => setImgError(true)} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, opacity: 0.2 }}>📦</div>
          )}
          <button onClick={toggleFav} className="fav-btn tap-btn" style={{ position: "absolute", top: 8, right: 8, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={favorited ? "var(--brand)" : "none"} stroke={favorited ? "var(--brand)" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            {listing.isFeatured && <span style={{ background: "var(--brand)", color: "#fff", fontSize: 9.5, fontWeight: 800, padding: "3px 9px", borderRadius: 100, letterSpacing: .4 }}>ÖNE ÇIKAN</span>}
            {cond && <span style={{ background: cond.bg, color: cond.color, fontSize: 9.5, fontWeight: 700, padding: "3px 9px", borderRadius: 100 }}>{cond.text}</span>}
          </div>
          {listing.images.length > 1 && (
            <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10.5, padding: "3px 8px", borderRadius: 100 }}>{listing.images.length}</div>
          )}
        </div>
        <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 21, fontWeight: 800, color: "#111", marginBottom: 4, letterSpacing: -0.5, fontFamily: "Bricolage Grotesque, sans-serif" }}>
            {"\u20BA"}{formatted}
          </div>
          <div style={{ fontSize: 13.5, color: "#444", lineHeight: 1.4, marginBottom: badges.length ? 8 : 0 }} className="line-clamp-2">{listing.title}</div>
          {badges.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {badges.slice(0, 4).map((b, i) => (
                <span key={i} style={{ padding: "3px 9px", borderRadius: 7, background: b.bg, fontSize: 11.5, fontWeight: 600, color: b.color, whiteSpace: "nowrap" }}>{b.label}</span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 10, borderTop: "0.5px solid #f5f5f3" }}>
            <span style={{ fontSize: 12, color: "#bbb" }}>{listing.city}{listing.district ? " · " + listing.district : ""}</span>
            <span style={{ fontSize: 11, color: "#ccc" }}>{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
