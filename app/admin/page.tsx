"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell, { type AdminTab } from "@/components/admin/AdminShell";

interface Stats { totalListings: number; activeListings: number; featuredListings: number; totalUsers: number; totalMessages: number; }
interface AdminListing {
  id: string; title: string; price: number; status: string; isFeatured: boolean; city: string;
  createdAt: string; user: { name: string; email: string }; category: { name: string };
  images: { url: string }[];
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  genel: { title: "Genel Bakış", subtitle: "Platform özeti ve istatistikler" },
  ilanlar: { title: "İlan Yönetimi", subtitle: "Tüm ilanları görüntüle, düzenle ve yönet" },
  kullanicilar: { title: "Kullanıcılar", subtitle: "Kayıtlı kullanıcıları ve rollerini görüntüle" },
};

function AdminPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const tab: AdminTab = tabParam === "ilanlar" || tabParam === "kullanicilar" ? tabParam : "genel";

  const [stats, setStats] = useState<Stats | null>(null);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  function setTab(next: AdminTab) {
    const qs = next === "genel" ? "" : `?tab=${next}`;
    router.push(`/admin${qs}`);
  }

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 403 || r.status === 401) {
          setAccessDenied(true);
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setStats(d); });
  }, []);

  useEffect(() => {
    if (tab !== "ilanlar") return;
    setLoading(true);
    fetch(`/api/admin/listings?page=${page}`)
      .then((r) => r.json())
      .then((d) => { setListings(d.listings || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  }, [page, tab]);

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

  if (accessDenied) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f8f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e5e5e5", padding: "2.5rem", maxWidth: 440, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Admin paneline erişim yok</h1>
          <p style={{ color: "#666", fontSize: 14.5, lineHeight: 1.6, marginBottom: 24 }}>
            Bu sayfayı yalnızca yönetici hesabıyla görüntüleyebilirsiniz. Devam etmek için giriş yapın.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/giris?redirect=/admin" style={{ background: "var(--brand)", color: "#fff", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Giriş Yap</Link>
            <Link href="/" style={{ background: "#f0f0f0", color: "#333", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Ana Sayfa</Link>
          </div>
        </div>
      </div>
    );
  }

  const { title, subtitle } = TAB_TITLES[tab];

  return (
    <AdminShell activeTab={tab} onTabChange={setTab} title={title} subtitle={subtitle}>
      {tab === "genel" && stats && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: "2rem" }}>
            {[
              { label: "Toplam İlan", value: stats.totalListings, icon: "📋", color: "#3b82f6" },
              { label: "Aktif İlan", value: stats.activeListings, icon: "✅", color: "#22c55e" },
              { label: "Öne Çıkan", value: stats.featuredListings, icon: "⭐", color: "var(--brand)" },
              { label: "Kullanıcı", value: stats.totalUsers, icon: "👥", color: "#8b5cf6" },
              { label: "Mesaj", value: stats.totalMessages, icon: "💬", color: "#f59e0b" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ background: "#fff", borderRadius: 14, border: "0.5px solid var(--border)", padding: "1.35rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color, marginBottom: 4, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{value}</div>
                <div style={{ fontSize: 13, color: "var(--ink-light)" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setTab("ilanlar")} style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              İlanları Yönet →
            </button>
            <button type="button" onClick={() => setTab("kullanicilar")} style={{ padding: "12px 20px", borderRadius: 10, border: "0.5px solid var(--border)", background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Kullanıcıları Gör →
            </button>
          </div>
        </>
      )}

      {tab === "ilanlar" && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İlan veya kullanıcı ara..."
              style={{ flex: 1, minWidth: 200, maxWidth: 360, padding: "10px 14px", border: "0.5px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }}
            />
            <span style={{ fontSize: 13, color: "var(--ink-light)" }}>{total} ilan</span>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid var(--border)", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid var(--border)", background: "var(--surface-page)" }}>
                  {["İlan", "Satıcı", "Fiyat", "Kategori", "Şehir", "Durum", "Öne Çıkan", "İşlemler"].map((h) => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "var(--ink-muted)", fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "var(--ink-light)" }}>Yükleniyor...</td></tr>
                ) : filtered.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "0.5px solid var(--border-light)" }}>
                    <td style={{ padding: "10px 14px", maxWidth: 220 }}>
                      <Link href={`/ilan/${l.id}`} target="_blank" style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 500, fontSize: 13 }}>
                        {l.title.length > 40 ? `${l.title.slice(0, 40)}...` : l.title}
                      </Link>
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-muted)" }}>{l.user.name}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>₺{new Intl.NumberFormat("tr-TR").format(l.price)}</td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-muted)" }}>{l.category.name}</td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-muted)" }}>{l.city}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <button type="button" onClick={() => toggleStatus(l.id, l.status)}
                        style={{ padding: "4px 10px", borderRadius: 100, border: "none", background: l.status === "ACTIVE" ? "#dcfce7" : "#f5f5f5", color: l.status === "ACTIVE" ? "#16a34a" : "#999", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                        {l.status === "ACTIVE" ? "Aktif" : "Pasif"}
                      </button>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <button type="button" onClick={() => toggleFeatured(l.id, l.isFeatured)}
                        style={{ padding: "4px 10px", borderRadius: 100, border: "none", background: l.isFeatured ? "var(--brand-soft)" : "#f5f5f5", color: l.isFeatured ? "var(--brand)" : "#999", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                        {l.isFeatured ? "⭐ Öne Çıkan" : "Öne Çıkar"}
                      </button>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <button type="button" onClick={() => deleteListing(l.id)}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "var(--brand-soft)", color: "var(--error)", fontSize: 11.5, cursor: "pointer" }}>
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
                <button key={p} type="button" onClick={() => setPage(p)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "0.5px solid var(--border)", background: p === page ? "var(--brand)" : "#fff", color: p === page ? "#fff" : "var(--ink)", fontSize: 13, cursor: "pointer" }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "kullanicilar" && <AdminUsers />}
    </AdminShell>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string; createdAt: string; _count: { listings: number } }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid var(--border)", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 600 }}>
        <thead>
          <tr style={{ borderBottom: "0.5px solid var(--border)", background: "var(--surface-page)" }}>
            {["Kullanıcı", "E-posta", "Rol", "İlanlar", "Kayıt Tarihi"].map((h) => (
              <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "var(--ink-muted)", fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--ink-light)" }}>Yükleniyor...</td></tr>
          ) : users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "0.5px solid var(--border-light)" }}>
              <td style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    {u.name[0]}
                  </div>
                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                </div>
              </td>
              <td style={{ padding: "10px 14px", color: "var(--ink-muted)" }}>{u.email}</td>
              <td style={{ padding: "10px 14px" }}>
                <span style={{ padding: "3px 8px", borderRadius: 100, background: u.role === "ADMIN" ? "var(--brand-soft)" : "#f5f5f5", color: u.role === "ADMIN" ? "var(--brand)" : "#666", fontSize: 11.5, fontWeight: 600 }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: "10px 14px", color: "var(--ink-muted)" }}>{u._count.listings}</td>
              <td style={{ padding: "10px 14px", color: "var(--ink-light)" }}>{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Yükleniyor...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}
