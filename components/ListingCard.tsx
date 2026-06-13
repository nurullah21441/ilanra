"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginPath } from "@/lib/auth-url";
import FavoriteButton from "@/components/FavoriteButton";

interface Listing {
  id: string; title: string; price: number; city: string; district?: string | null;
  isFeatured: boolean; createdAt: string; condition?: string; description?: string;
  images: { url: string }[]; category: { name: string; slug: string };
}

type ListingCardVariant = "compact" | "vitrin";

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

export default function ListingCard({ listing, variant = "compact" }: { listing: Listing; variant?: ListingCardVariant }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const img = listing.images[0]?.url;
  const formatted = new Intl.NumberFormat("tr-TR").format(listing.price);
  const cond = listing.condition ? conditionLabel[listing.condition] : null;
  const specs = listing.description ? parseSpecs(listing.description) : {};
  const badges = getBadges(listing.category.slug, specs);
  const isCompact = variant === "compact";

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user) {
      router.push(loginPath(`/ilan/${listing.id}`));
      return;
    }

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: listing.id }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setFavorited(data.favorited);
  }

  const cardClass = isCompact ? "listing-card-compact" : "listing-card-vitrin";
  const radius = isCompact ? 4 : 10;
  const imgH = isCompact ? 128 : 168;
  const priceSize = isCompact ? 17 : 21;
  const titleSize = isCompact ? 13 : 13.5;
  const pad = isCompact ? "10px 11px 11px" : "12px 14px 14px";

  return (
    <Link href={"/ilan/" + listing.id} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
      <article
        className={cardClass}
        style={{
          background: "#fff",
          border: listing.isFeatured
            ? `1px solid ${isCompact ? "var(--brand)" : "var(--brand)"}`
            : "1px solid var(--border)",
          borderRadius: radius,
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ position: "relative", height: imgH, background: "#f5f5f3", flexShrink: 0, overflow: "hidden" }}>
          {img && !imgError ? (
            <img src={img} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgError(true)} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isCompact ? 32 : 44, opacity: 0.2 }}>📦</div>
          )}
          <FavoriteButton
            active={favorited}
            onClick={toggleFav}
            size={isCompact ? "sm" : "md"}
          />
          <div style={{ position: "absolute", top: isCompact ? 6 : 10, left: isCompact ? 6 : 10, display: "flex", flexDirection: "column", gap: 3 }}>
            {listing.isFeatured && (
              <span style={{ background: "var(--brand)", color: "#fff", fontSize: 9, fontWeight: 700, padding: isCompact ? "2px 6px" : "3px 9px", borderRadius: isCompact ? 3 : 100, letterSpacing: 0.3 }}>
                ÖNE ÇIKAN
              </span>
            )}
            {cond && (
              <span style={{ background: cond.bg, color: cond.color, fontSize: 9, fontWeight: 600, padding: isCompact ? "2px 6px" : "3px 9px", borderRadius: isCompact ? 3 : 100 }}>
                {cond.text}
              </span>
            )}
          </div>
          {listing.images.length > 1 && (
            <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 3 }}>
              {listing.images.length}
            </div>
          )}
        </div>
        <div style={{ padding: pad, display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: priceSize, fontWeight: 700, color: "#111", marginBottom: 3, letterSpacing: isCompact ? 0 : -0.5, fontFamily: isCompact ? "inherit" : "Bricolage Grotesque, sans-serif" }}>
            {"\u20BA"}{formatted}
          </div>
          <div style={{ fontSize: titleSize, color: "#333", lineHeight: 1.35, marginBottom: badges.length ? 6 : 0 }} className="line-clamp-2">{listing.title}</div>
          {badges.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {badges.slice(0, isCompact ? 3 : 4).map((b, i) => (
                <span key={i} style={{ padding: "2px 7px", borderRadius: isCompact ? 3 : 7, background: b.bg, fontSize: 11, fontWeight: 500, color: b.color, whiteSpace: "nowrap" }}>{b.label}</span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: isCompact ? 8 : 10, borderTop: "1px solid var(--border-light)" }}>
            <span style={{ fontSize: 11, color: "#999" }}>{listing.city}{listing.district ? " · " + listing.district : ""}</span>
            <span style={{ fontSize: 10.5, color: "#bbb" }}>{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
