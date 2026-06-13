"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

interface Stats { totalListings: number; activeListings: number; featuredListings: number; totalUsers: number; totalMessages: number; }
interface AdminListing {
  id: string; title: string; price: number; status: string; isFeatured: boolean; city: string;
  createdAt: string; user: { name: string; email: string }; category: { name: string };
  images: { url: string }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ilanlar" | "kullanicilar">("ilanlar");
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => { if (r.status === 403) { router.push("/"); } return r.json(); })
      .then((d) => setStats(d));
  }, [router]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/listings?page=${page}`)
      .then((r) => r.json())
      .then((d) => { setListings(d.listings || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  }, [page]);

  async function toggleFeatured(id: string, current: boolean) {
    await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !current }),
    });
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, isFeatured: !current } : l));
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: next } : l));
  }

  async function deleteListing(id: string) {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  const filtered = listings.filter((l) =>
    search ? l.title.toLowerCase().includes(search.toLowerCase()) || l.user.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f6" }}>
      {/* ADMIN NAV */}
      <nav style={{ background: "#1a1a1a", padding: "0 1.5rem", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <Logo height={30} variant="light" />
          </Link>
          <span style={{ color: "#555", fontSize: 13 }}>/ Admin Panel</span>
        </div>
        <Link href="/" style={{ fontSize: 13, color: "#aaa", textDecoration: "none" }}>← Siteye dön</Link>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem" }}>
        {/* STATS */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: "2rem" }}>
            {[
              { label: "Toplam İlan", value: stats.totalListings, icon: "📋", color: "#3b82f6" },
              { label: "Aktif İlan", value: stats.activeListings, icon: "✅", color: "#22c55e" },
              { label: "Öne Çıkan", value: stats.featuredListings, icon: "⭐", color: "#e63946" },
              { label: "Kullanıcı", value: stats.totalUsers, icon: "👥", color: "#8b5cf6" },
              { label: "Mesaj", value: stats.totalMessages, icon: "💬", color: "#f59e0b" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", padding: "1.25rem" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
                <div style={{ fontSize: 12.5, color: "#999" }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 10, border: "0.5px solid #e5e5e5", padding: 4, width: "fit-content", marginBottom: "1.5rem" }}>
          {(["ilanlar", "kullanicilar"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: tab === t ? "#e63946" : "transparent", color: tab === t ? "#fff" : "#666", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              {t === "ilanlar" ? "İlanlar" : "Kullanıcılar"}
            </button>
          ))}
        </div>

        {tab === "ilanlar" && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: "1rem", alignItems: "center" }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="İlan veya kullanıcı ara..."
                style={{ flex: 1, maxWidth: 360, padding: "9px 14px", border: "0.5px solid #e5e5e5", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }} />
              <span style={{ fontSize: 13, color: "#999" }}>{total} ilan</span>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid #e5e5e5", background: "#fafafa" }}>
                    {["İlan", "Satıcı", "Fiyat", "Kategori", "Şehir", "Durum", "Öne Çıkan", "İşlemler"].map((h) => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontWeight: 600, color: "#555", fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>Yükleniyor...</td></tr>
                  ) : filtered.map((l) => (
                    <tr key={l.id} style={{ borderBottom: "0.5px solid #f5f5f5" }}
                    >
                      <td style={{ padding: "10px 14px", maxWidth: 220 }}>
                        <Link href={`/ilan/${l.id}`} target="_blank" style={{ color: "#1a1a1a", textDecoration: "none", fontWeight: 500, fontSize: 13 }}>
                          {l.title.length > 40 ? l.title.slice(0, 40) + "..." : l.title}
                        </Link>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#666" }}>{l.user.name}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>₺{new Intl.NumberFormat("tr-TR").format(l.price)}</td>
                      <td style={{ padding: "10px 14px", color: "#666" }}>{l.category.name}</td>
                      <td style={{ padding: "10px 14px", color: "#666" }}>{l.city}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <button onClick={() => toggleStatus(l.id, l.status)}
                          style={{ padding: "4px 10px", borderRadius: 100, border: "none", background: l.status === "ACTIVE" ? "#dcfce7" : "#f5f5f5", color: l.status === "ACTIVE" ? "#16a34a" : "#999", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                          {l.status === "ACTIVE" ? "Aktif" : "Pasif"}
                        </button>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <button onClick={() => toggleFeatured(l.id, l.isFeatured)}
                          style={{ padding: "4px 10px", borderRadius: 100, border: "none", background: l.isFeatured ? "#fef2f2" : "#f5f5f5", color: l.isFeatured ? "#e63946" : "#999", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                          {l.isFeatured ? "⭐ Öne Çıkan" : "Öne Çıkar"}
                        </button>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <button onClick={() => deleteListing(l.id)}
                          style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#fef2f2", color: "#dc2626", fontSize: 11.5, cursor: "pointer" }}>
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1.5rem" }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: 34, height: 34, borderRadius: 8, border: "0.5px solid #e5e5e5", background: p === page ? "#e63946" : "#fff", color: p === page ? "#fff" : "#1a1a1a", fontSize: 13, cursor: "pointer" }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "kullanicilar" && (
          <AdminUsers />
        )}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<{id:string;name:string;email:string;role:string;createdAt:string;_count:{listings:number}}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ borderBottom: "0.5px solid #e5e5e5", background: "#fafafa" }}>
            {["Kullanıcı", "E-posta", "Rol", "İlanlar", "Kayıt Tarihi"].map((h) => (
              <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontWeight: 600, color: "#555", fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>Yükleniyor...</td></tr>
          ) : users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "0.5px solid #f5f5f5" }}>
              <td style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e63946", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    {u.name[0]}
                  </div>
                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                </div>
              </td>
              <td style={{ padding: "10px 14px", color: "#666" }}>{u.email}</td>
              <td style={{ padding: "10px 14px" }}>
                <span style={{ padding: "3px 8px", borderRadius: 100, background: u.role === "ADMIN" ? "#fef2f2" : "#f5f5f5", color: u.role === "ADMIN" ? "#e63946" : "#666", fontSize: 11.5, fontWeight: 600 }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: "10px 14px", color: "#666" }}>{u._count.listings}</td>
              <td style={{ padding: "10px 14px", color: "#999" }}>{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
