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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
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

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("Yeni şifreler eşleşmiyor");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordError("Yeni şifre en az 6 karakter olmalı");
      return;
    }
    setPasswordLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      }),
    });
    const data = await res.json();
    setPasswordLoading(false);
    if (!res.ok) {
      setPasswordError(data.error || "Şifre güncellenemedi");
      return;
    }
    setPasswordSuccess("Şifreniz güncellendi.");
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setShowPasswordForm(false);
  }

  if (!user) return <><Navbar /><div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>Yükleniyor...</div></>;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2rem", alignItems: "start" }}>
          {/* SIDEBAR */}
          <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", padding: "1.5rem", position: "sticky", top: 76 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid #f0f0f0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700 }}>
                {user.name[0]}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: "#999" }}>{user.email}</div>
                {user.role === "ADMIN" && (
                  <span style={{ fontSize: 11, background: "var(--brand-soft)", color: "var(--brand)", padding: "2px 8px", borderRadius: 100, fontWeight: 600, marginTop: 4, display: "inline-block" }}>ADMIN</span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {user.role === "ADMIN" && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "#aaa", padding: "8px 14px 4px", textTransform: "uppercase" }}>Yönetim</div>
                  <a href="/admin" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#fff", fontWeight: 600, textDecoration: "none", display: "block", background: "var(--surface-dark)" }}>📊 Kontrol Paneli</a>
                  <a href="/admin?tab=ilanlar" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "var(--ink)", textDecoration: "none", display: "block" }}>📋 Tüm İlanlar</a>
                  <a href="/admin?tab=kullanicilar" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "var(--ink)", textDecoration: "none", display: "block" }}>👥 Kullanıcılar</a>
                  <div style={{ height: 1, background: "#f0f0f0", margin: "8px 0" }} />
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "#aaa", padding: "4px 14px", textTransform: "uppercase" }}>Hesabım</div>
                </>
              )}
              <a href="/ilan-ver" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#1a1a1a", textDecoration: "none", display: "block", background: user.role !== "ADMIN" ? "#fafafa" : "transparent" }}>+ İlan ver</a>
              <a href="/mesajlar" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#1a1a1a", textDecoration: "none", display: "block" }}>💬 Mesajlar</a>
              <a href="/favoriler" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#1a1a1a", textDecoration: "none", display: "block" }}>❤️ Favoriler</a>
              <button
                type="button"
                onClick={() => { setShowPasswordForm((v) => !v); setPasswordError(""); setPasswordSuccess(""); }}
                style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#1a1a1a", textDecoration: "none", display: "block", background: "none", border: "none", textAlign: "left", cursor: "pointer", width: "100%" }}
              >
                🔑 Şifre değiştir
              </button>
            </div>

            {passwordSuccess && (
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "#ecfdf5", color: "#15803d", fontSize: 13 }}>
                {passwordSuccess}
              </div>
            )}

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} style={{ marginTop: 12, paddingTop: 12, borderTop: "0.5px solid #f0f0f0" }}>
                {passwordError && (
                  <div style={{ background: "var(--brand-soft)", color: "#dc2626", padding: "8px 10px", borderRadius: 8, fontSize: 12.5, marginBottom: 10 }}>
                    {passwordError}
                  </div>
                )}
                {[
                  { label: "Mevcut şifre", key: "current" as const },
                  { label: "Yeni şifre", key: "newPass" as const },
                  { label: "Yeni şifre tekrar", key: "confirm" as const },
                ].map(({ label, key }) => (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</label>
                    <input
                      type="password"
                      value={passwordForm[key]}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, [key]: e.target.value }))}
                      required
                      minLength={key === "current" ? 1 : 6}
                      style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "0.5px solid #e5e5e5", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: passwordLoading ? "wait" : "pointer", opacity: passwordLoading ? 0.7 : 1 }}
                >
                  {passwordLoading ? "Kaydediliyor..." : "Şifreyi güncelle"}
                </button>
              </form>
            )}
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
                <a href="/ilan-ver" style={{ display: "inline-block", marginTop: 12, padding: "10px 24px", background: "var(--brand)", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 500 }}>
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
