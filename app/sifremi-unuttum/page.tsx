"use client";
import { useState } from "react";
import Link from "next/link";

export default function SifremiUnuttumPage() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setLoading(false);
    setStep("reset");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== newPass2) { setError("Şifreler eşleşmiyor"); return; }
    if (newPass.length < 6) { setError("Şifre en az 6 karakter olmalı"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword: newPass }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setLoading(false);
    setStep("done");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F7F5", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 18, border: "0.5px solid #E8E8E5", padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

        <Link href="/" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, textDecoration: "none", display: "inline-flex", alignItems: "baseline", marginBottom: "2rem" }}>
          <span style={{ color: "#111" }}>ilan</span>
          <span style={{ color: "#E63946" }}>ra</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E63946", display: "inline-block", marginLeft: 1, marginBottom: 8 }} />
        </Link>

        {step === "email" && (
          <>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Şifremi Unuttum</h1>
            <p style={{ fontSize: 13.5, color: "#888", marginBottom: "1.75rem" }}>
              Hesabına kayıtlı e-posta adresini gir, yeni şifre belirle.
            </p>
            {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: 9, fontSize: 13.5, marginBottom: "1rem", border: "0.5px solid #fecaca" }}>⚠️ {error}</div>}
            <form onSubmit={handleEmail}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "#444" }}>E-posta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" required
                style={{ width: "100%", padding: "11px 14px", border: "0.5px solid #E8E8E5", borderRadius: 9, fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: "1rem" }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#E63946"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E8E8E5"}
              />
              <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: loading ? "#ccc" : "#E63946", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Kontrol ediliyor..." : "Devam et →"}
              </button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Yeni Şifre Belirle</h1>
            <p style={{ fontSize: 13.5, color: "#888", marginBottom: "1.75rem" }}>
              <strong style={{ color: "#333" }}>{email}</strong> hesabı için yeni şifre oluştur.
            </p>
            {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: 9, fontSize: 13.5, marginBottom: "1rem", border: "0.5px solid #fecaca" }}>⚠️ {error}</div>}
            <form onSubmit={handleReset}>
              {[
                { label: "Yeni Şifre", key: "new", val: newPass, set: setNewPass },
                { label: "Şifre Tekrar", key: "new2", val: newPass2, set: setNewPass2 },
              ].map(({ label, key, val, set }) => (
                <div key={key} style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "#444" }}>{label}</label>
                  <input type="password" value={val} onChange={e => set(e.target.value)} placeholder="••••••••" required minLength={6}
                    style={{ width: "100%", padding: "11px 14px", border: "0.5px solid #E8E8E5", borderRadius: 9, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#E63946"}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E8E8E5"}
                  />
                </div>
              ))}
              <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: loading ? "#ccc" : "#E63946", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? (
                  <><div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />Kaydediliyor...</>
                ) : "Şifremi Güncelle →"}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Şifre Güncellendi!</h2>
            <p style={{ fontSize: 14, color: "#888", marginBottom: "1.5rem" }}>Yeni şifrenle giriş yapabilirsin.</p>
            <Link href="/giris" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 28px", background: "#E63946", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
              Giriş yap →
            </Link>
          </div>
        )}

        {step !== "done" && (
          <p style={{ textAlign: "center", fontSize: 13.5, color: "#888", marginTop: "1.5rem" }}>
            <Link href="/giris" style={{ color: "#E63946", textDecoration: "none", fontWeight: 500 }}>← Giriş sayfasına dön</Link>
          </p>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
