"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function KayitPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f6", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e5e5e5", padding: "2.5rem", width: "100%", maxWidth: 420 }}>
        <Link href="/" style={{ textDecoration: "none", display: "block", marginBottom: "2rem" }}>
          <Logo height={40} />
        </Link>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: "0.5rem" }}>Kayıt ol</h1>
        <p style={{ fontSize: 13.5, color: "#666", marginBottom: "1.75rem" }}>Hemen ücretsiz hesap oluştur.</p>

        {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13.5, marginBottom: "1rem", border: "0.5px solid #fecaca" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { label: "Ad Soyad", type: "text", key: "name", placeholder: "Ahmet Yılmaz" },
            { label: "E-posta", type: "email", key: "email", placeholder: "ornek@email.com" },
            { label: "Telefon (opsiyonel)", type: "tel", key: "phone", placeholder: "0532 000 00 00" },
            { label: "Şifre", type: "password", key: "password", placeholder: "En az 6 karakter" },
          ].map(({ label, type, key, placeholder }) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key !== "phone"}
                style={{ width: "100%", padding: "10px 14px", border: "0.5px solid #e5e5e5", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "#e63946", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit", marginTop: 8 }}>
            {loading ? "Kaydediliyor..." : "Kayıt ol"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13.5, color: "#666", marginTop: "1.5rem" }}>
          Zaten hesabın var mı?{" "}
          <Link href="/giris" style={{ color: "#e63946", textDecoration: "none", fontWeight: 500 }}>Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}
