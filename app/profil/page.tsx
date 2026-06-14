"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import { loginPath } from "@/lib/auth-url";
import { describeSavedSearch, filtersToSearchParams, type SavedSearchFilters } from "@/lib/saved-search";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  showPhoneOnListings: boolean;
  isVerified: boolean;
  role: string;
}
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
  const [contactPhone, setContactPhone] = useState("");
  const [showPhoneOnListings, setShowPhoneOnListings] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyDevUrl, setVerifyDevUrl] = useState("");
  const [savedSearches, setSavedSearches] = useState<{ id: string; name: string | null; filters: SavedSearchFilters; createdAt: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) { router.replace(loginPath("/profil")); return; }
      setUser(d.user);
      setContactPhone(d.user.phone || "");
      setShowPhoneOnListings(!!d.user.showPhoneOnListings);
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/listings?mine=1&limit=50").then((r) => r.json()).then((d) => {
      setListings(d.listings || []);
    }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/saved-searches").then((r) => r.json()).then((d) => {
      setSavedSearches((d.searches || []).map((s: { id: string; name: string | null; filters: SavedSearchFilters; createdAt: string }) => ({
        ...s,
        filters: (s.filters || {}) as SavedSearchFilters,
      })));
    });
  }, [user]);

  async function sendVerification() {
    setVerifyLoading(true);
    setVerifyMsg("");
    setVerifyDevUrl("");
    const res = await fetch("/api/auth/send-verification", { method: "POST" });
    const data = await res.json();
    setVerifyLoading(false);
    if (!res.ok) {
      setVerifyMsg(data.error || "Gönderilemedi");
      return;
    }
    setVerifyMsg(data.message || "Doğrulama e-postası gönderildi.");
    if (data.devVerifyUrl) setVerifyDevUrl(data.devVerifyUrl);
  }

  async function deleteSavedSearch(id: string) {
    await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }

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

  async function handleContactSave(e: React.FormEvent) {
    e.preventDefault();
    setContactError("");
    setContactSuccess("");
    setContactLoading(true);

    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: contactPhone.trim() || null,
        showPhoneOnListings: showPhoneOnListings && !!contactPhone.trim(),
      }),
    });
    const data = await res.json();
    setContactLoading(false);

    if (!res.ok) {
      setContactError(data.error || "Ayarlar kaydedilemedi");
      return;
    }

    setUser(data.user);
    setContactPhone(data.user.phone || "");
    setShowPhoneOnListings(!!data.user.showPhoneOnListings);
    setContactSuccess("İletişim ayarları güncellendi.");
  }

  if (!user) return <><Navbar /><div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>Yükleniyor...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <div className="profile-grid">
          {/* SIDEBAR */}
          <div className="profile-sidebar" style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", padding: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid #f0f0f0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700 }}>
                {user.name[0]}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: "#999" }}>{user.email}</div>
                {user.isVerified ? (
                  <span style={{ fontSize: 11, background: "#ecfdf5", color: "#15803d", padding: "2px 8px", borderRadius: 100, fontWeight: 600, marginTop: 4, display: "inline-block" }}>✓ Doğrulanmış</span>
                ) : (
                  <span style={{ fontSize: 11, background: "#fff7ed", color: "#c2410c", padding: "2px 8px", borderRadius: 100, fontWeight: 600, marginTop: 4, display: "inline-block" }}>E-posta doğrulanmadı</span>
                )}
                {user.role === "ADMIN" && (
                  <span style={{ fontSize: 11, background: "var(--brand-soft)", color: "var(--brand)", padding: "2px 8px", borderRadius: 100, fontWeight: 600, marginTop: 4, display: "inline-block" }}>ADMIN</span>
                )}
              </div>
            </div>

            {!user.isVerified && (
              <div style={{ marginTop: 12, padding: "12px", borderRadius: 10, background: "#fff7ed", border: "0.5px solid #fed7aa" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#c2410c", marginBottom: 6 }}>E-postanı doğrula</div>
                <p style={{ fontSize: 12, color: "#9a3412", lineHeight: 1.45, marginBottom: 10 }}>
                  E-postanı doğrulayınca güvenilir satıcı rozeti alırsın ve mesajlaşabilirsin.
                </p>
                {verifyMsg && <p style={{ fontSize: 12, color: "#166534", marginBottom: 8, lineHeight: 1.45 }}>{verifyMsg}</p>}
                {verifyDevUrl && (
                  <div style={{ marginBottom: 10, padding: 10, borderRadius: 8, background: "#fff", border: "1px solid #fed7aa" }}>
                    <p style={{ fontSize: 11, color: "#9a3412", marginBottom: 8, lineHeight: 1.45 }}>
                      Geliştirme modu: <strong>e@gmail.com</strong> gibi adreslere mail gitmez. Aşağıdaki linke tıkla:
                    </p>
                    <a
                      href={verifyDevUrl}
                      style={{
                        display: "block",
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "var(--brand)",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                        textAlign: "center",
                        wordBreak: "break-all",
                      }}
                    >
                      E-postamı doğrula →
                    </a>
                  </div>
                )}
                <button
                  type="button"
                  onClick={sendVerification}
                  disabled={verifyLoading}
                  style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "#ea580c", color: "#fff", fontWeight: 600, fontSize: 13, cursor: verifyLoading ? "wait" : "pointer", opacity: verifyLoading ? 0.7 : 1 }}
                >
                  {verifyLoading ? "Gönderiliyor..." : "Doğrulama linki gönder"}
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {user.role === "ADMIN" && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "#aaa", padding: "8px 14px 4px", textTransform: "uppercase" }}>Yönetim</div>
                  <a href="/admin" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "#fff", fontWeight: 600, textDecoration: "none", display: "block", background: "var(--surface-dark)" }}>📊 Kontrol Paneli</a>
                  <a href="/admin?tab=ilanlar" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "var(--ink)", textDecoration: "none", display: "block" }}>📋 Tüm İlanlar</a>
                  <a href="/admin?tab=kullanicilar" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "var(--ink)", textDecoration: "none", display: "block" }}>👥 Kullanıcılar</a>
                  <a href="/admin?tab=sikayetler" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: "var(--ink)", textDecoration: "none", display: "block" }}>🚩 Şikayetler</a>
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

            <form onSubmit={handleContactSave} style={{ marginTop: 16, paddingTop: 16, borderTop: "0.5px solid #f0f0f0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 10 }}>İletişim ayarları</div>
              {contactError && (
                <div style={{ background: "var(--brand-soft)", color: "#dc2626", padding: "8px 10px", borderRadius: 8, fontSize: 12.5, marginBottom: 10 }}>
                  {contactError}
                </div>
              )}
              {contactSuccess && (
                <div style={{ background: "#ecfdf5", color: "#15803d", padding: "8px 10px", borderRadius: 8, fontSize: 12.5, marginBottom: 10 }}>
                  {contactSuccess}
                </div>
              )}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>Telefon (opsiyonel)</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value);
                    if (!e.target.value.trim()) setShowPhoneOnListings(false);
                  }}
                  placeholder="0532 000 00 00"
                  style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "0.5px solid #e5e5e5", fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12.5, color: "#444", lineHeight: 1.45, cursor: contactPhone.trim() ? "pointer" : "not-allowed", opacity: contactPhone.trim() ? 1 : 0.55 }}>
                <input
                  type="checkbox"
                  checked={showPhoneOnListings}
                  disabled={!contactPhone.trim()}
                  onChange={(e) => setShowPhoneOnListings(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "var(--brand)" }}
                />
                <span>İlanlarımda telefon numaramı göster</span>
              </label>
              <p style={{ fontSize: 11.5, color: "#999", marginTop: 8, lineHeight: 1.45 }}>
                Varsayılan olarak numaran gizlidir. İstersen mesajlaşma sonrası sohbet içinde de paylaşabilirsin.
              </p>
              <button
                type="submit"
                disabled={contactLoading}
                style={{ width: "100%", marginTop: 12, padding: "10px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: contactLoading ? "wait" : "pointer", opacity: contactLoading ? 0.7 : 1 }}
              >
                {contactLoading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </form>
          </div>

          {/* MAIN */}
          <div>
            {savedSearches.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Kayıtlı aramalar</h2>
                <p style={{ fontSize: 12.5, color: "#888", marginBottom: "1rem" }}>
                  Yeni ilan gelince e-posta ile bildirim alırsın.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {savedSearches.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "12px 14px",
                        background: "#fff",
                        borderRadius: 10,
                        border: "0.5px solid #e5e5e5",
                      }}
                    >
                      <a
                        href={`/ilanlar?${filtersToSearchParams(s.filters)}`}
                        style={{ textDecoration: "none", color: "#111", fontSize: 13.5, fontWeight: 600, flex: 1, minWidth: 0 }}
                      >
                        {s.name || describeSavedSearch(s.filters)}
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteSavedSearch(s.id)}
                        style={{ background: "none", border: "none", color: "#999", fontSize: 12, cursor: "pointer", flexShrink: 0 }}
                      >
                        Sil
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: "1.5rem" }}>İlanlarım</h2>
            {loading ? (
              <p style={{ color: "#999" }}>Yükleniyor...</p>
            ) : listings.length > 0 ? (
              <div className="listing-cards-grid">
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
