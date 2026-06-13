"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";

interface User { id: string; name: string; email: string; phone: string; role: string; }
interface Listing { id: string; title: string; price: number; city: string; isFeatured: boolean; createdAt: string; status: string; images: { url: string }[]; category: { name: string; slug: string }; }

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) { router.push("/giris"); return; }
      setUser(d.user);
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/listings?limit=50").then((r) => r.json()).then((d) => {
      setListings((d.listings || []).filter((l: Listing & { user: { id: string } }) => l.user?.id === user.id));
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return <><Navbar /><div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>Yükleniyor...</div></>;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2rem", alignItems: "start" }}>
          {/* SIDEBAR */}
          <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", padding: "1.5rem", position: "sticky", top: 76 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid #f0f0f0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e63946", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700 }}>
                {user.name[0]}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: "#999" }}>{user.email}</div>
                {user.role === "ADMIN" && (
                  <span style={{ fontSize: 11, background: "#fef2f2", color: "#e63946", padding: "2px 8px", borderRadius: 100, fontWeight: 600, marginTop: 4, display: "inline-block" }}>ADMIN</span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {user.role === "ADMIN" && (
                <a href="/admin" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#e63946", fontWeight: 500, textDecoration: "none", display: "block" }}>🔧 Admin Panel</a>
              )}
              <a href="/ilan-ver" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#1a1a1a", textDecoration: "none", display: "block", background: "#fafafa" }}>+ İlan ver</a>
              <a href="/mesajlar" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#1a1a1a", textDecoration: "none", display: "block" }}>💬 Mesajlar</a>
              <a href="/favoriler" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#1a1a1a", textDecoration: "none", display: "block" }}>❤️ Favoriler</a>
            </div>
          </div>

          {/* MAIN */}
          <div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: "1.5rem" }}>İlanlarım</h2>
            {loading ? (
              <p style={{ color: "#999" }}>Yükleniyor...</p>
            ) : listings.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", color: "#999" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p>Henüz ilan vermediniz.</p>
                <a href="/ilan-ver" style={{ display: "inline-block", marginTop: 12, padding: "10px 24px", background: "#e63946", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 500 }}>
                  İlan ver
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
