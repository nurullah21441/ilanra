"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthLayout, { AuthError, AuthField, AuthButton, AuthLink } from "@/components/auth/AuthLayout";

function SifreSifirlaForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [valid, setValid] = useState<boolean | null>(null);
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setValid(false);
      return;
    }
    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setValid(!!d.valid))
      .catch(() => setValid(false));
  }, [token]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== newPass2) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    if (newPass.length < 6) {
      setError("Şifre en az 6 karakter olmalı");
      return;
    }

    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: newPass }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Şifre güncellenemedi");
      return;
    }
    setDone(true);
  }

  if (valid === null) {
    return (
      <AuthLayout variant="forgot" title="Yükleniyor..." subtitle="">
        <p style={{ fontSize: 14, color: "#999", textAlign: "center" }}>Bağlantı kontrol ediliyor...</p>
      </AuthLayout>
    );
  }

  if (!valid) {
    return (
      <AuthLayout
        variant="forgot"
        title="Geçersiz bağlantı"
        subtitle="Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş."
        footer={<AuthLink href="/sifremi-unuttum">Yeni bağlantı iste</AuthLink>}
      >
        <AuthError>Bağlantı kullanılamıyor. Lütfen tekrar şifre sıfırlama talebi oluşturun.</AuthError>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout variant="forgot" title="" footer={null}>
        <div className="auth-success">
          <div className="auth-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="auth-success-title">Şifre güncellendi</h2>
          <p className="auth-success-text">Yeni şifrenle giriş yapabilirsin.</p>
          <AuthLink href="/giris">Giriş yap</AuthLink>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variant="forgot"
      title="Yeni şifre belirle"
      subtitle="Hesabın için güçlü bir şifre oluştur."
      footer={<AuthLink href="/giris">← Giriş sayfasına dön</AuthLink>}
    >
      <div className="auth-icon-badge">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>

      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleReset}>
        <AuthField
          label="Yeni şifre"
          type="password"
          name="newPassword"
          value={newPass}
          onChange={setNewPass}
          placeholder="En az 6 karakter"
          minLength={6}
          autoComplete="new-password"
        />
        <AuthField
          label="Şifre tekrar"
          type="password"
          name="confirmPassword"
          value={newPass2}
          onChange={setNewPass2}
          placeholder="••••••••"
          minLength={6}
          autoComplete="new-password"
        />
        <AuthButton loading={loading} loadingText="Kaydediliyor...">
          Şifremi güncelle
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default function SifreSifirlaPage() {
  return (
    <Suspense>
      <SifreSifirlaForm />
    </Suspense>
  );
}
