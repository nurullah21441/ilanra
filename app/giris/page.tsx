"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";

function GirisForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    router.push(redirect);
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f7f5", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 18, border: "0.5px solid #e8e8e5", padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "block", marginBottom: "2rem" }}>
          <Logo size={28} />
        </Link>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: "0.4rem" }}>Giriş yap</h1>
        <p style={{ fontSize: 13.5, color: "#888", marginBottom: "1.75rem" }}>
          {redirect !== "/" ? "İlan vermek için giriş yapman gerekiyor." : "Hesabına giriş yap."}
        </p>

        {error && (
          <div style={{ background: "var(--brand-soft)", color: "#dc2626", padding: "10px 14px", borderRadius: 9, fontSize: 13.5, marginBottom: "1rem", border: "0.5px solid var(--brand-border)" }}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: "E-posta", type: "email", key: "email", placeholder: "ornek@email.com" },
            { label: "Şifre", type: "password", key: "password", placeholder: "••••••••" },
          ].map(({ label, type, key, placeholder }) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6, color: "#444" }}>{label}</label>
              <input type={type} placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                required
                style={{ width: "100%", padding: "11px 14px", border: "0.5px solid #e8e8e5", borderRadius: 9, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--brand)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#e8e8e5"}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px", background: loading ? "#ccc" : "var(--brand)",
            color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 8,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading ? (
              <><div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />Giriş yapılıyor...</>
            ) : "Giriş yap →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ fontSize: 13, marginBottom: "0.75rem" }}>
            <Link href="/sifremi-unuttum" style={{ color: "#888", textDecoration: "none" }}>Şifremi unuttum</Link>
          </p>
          <p style={{ fontSize: 13.5, color: "#888" }}>
            Hesabın yok mu?{" "}
            <Link href="/kayit" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Kayıt ol</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function GirisPage() {
  return <Suspense><GirisForm /></Suspense>;
}
