"use client";
import { useState } from "react";
import AuthLayout, { AuthError, AuthField, AuthButton, AuthLink } from "@/components/auth/AuthLayout";

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDevResetUrl(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "İşlem başarısız");
      return;
    }

    setSent(true);
    if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
  }

  if (sent) {
    return (
      <AuthLayout
        variant="forgot"
        title="E-postanı kontrol et"
        subtitle="Kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi. Gelen kutunu ve spam klasörünü kontrol et."
        footer={<AuthLink href="/giris">← Giriş sayfasına dön</AuthLink>}
      >
        <div className="auth-success">
          <div className="auth-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <p className="auth-success-text" style={{ marginBottom: devResetUrl ? 12 : 24 }}>
            <strong>{email}</strong> adresine link gönderildi (hesap varsa).
          </p>
          {devResetUrl && (
            <p style={{ fontSize: 12, color: "#666", marginBottom: 16, wordBreak: "break-all", lineHeight: 1.5 }}>
              Geliştirme modu:{" "}
              <a href={devResetUrl} style={{ color: "var(--brand)" }}>{devResetUrl}</a>
            </p>
          )}
          <AuthLink href="/giris">Giriş yap</AuthLink>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variant="forgot"
      title="Şifremi unuttum"
      subtitle="Hesabına kayıtlı e-posta adresini gir. Sana güvenli bir sıfırlama bağlantısı göndereceğiz."
      footer={<AuthLink href="/giris">← Giriş sayfasına dön</AuthLink>}
    >
      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleEmail}>
        <AuthField
          label="E-posta"
          type="email"
          name="email"
          value={email}
          onChange={setEmail}
          placeholder="ornek@email.com"
          autoComplete="email"
        />
        <AuthButton loading={loading} loadingText="Gönderiliyor...">
          Sıfırlama bağlantısı gönder
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
