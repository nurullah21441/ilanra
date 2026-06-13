"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import { loginPath } from "@/lib/auth-url";

export default function FavorilerPage() {
  const [favorites, setFavorites] = useState<{listing: {id:string;title:string;price:number;city:string;isFeatured:boolean;createdAt:string;images:{url:string}[];category:{name:string;slug:string}}}[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) { router.replace(loginPath("/favoriler")); return; }
    });
    fetch("/api/favorites").then((r) => {
      if (r.status === 401) { router.replace(loginPath("/favoriler")); return null; }
      return r.json();
    }).then((d) => { if (d) setFavorites(d.favorites || []); }).finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: "2rem auto", padding: "0 1.5rem" }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: "1.5rem" }}>Favorilerim</h1>
        {loading ? <p style={{ color: "#999" }}>Yükleniyor...</p> : favorites.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {favorites.map((f) => <ListingCard key={f.listing.id} listing={{ ...f.listing, createdAt: String(f.listing.createdAt) }} />)}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem", color: "#999", background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
            <p>Henüz favori eklemediniz.</p>
          </div>
        )}
      </div>
    </>
  );
}
