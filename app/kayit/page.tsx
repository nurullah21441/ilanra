"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout, { AuthError, AuthField, AuthButton, AuthLink } from "@/components/auth/AuthLayout";

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
    <AuthLayout
      variant="register"
      title="Kayıt ol"
      subtitle="Ücretsiz hesap oluştur, hemen ilan vermeye başla."
      footer={
        <p>
          Zaten hesabın var mı? <AuthLink href="/giris">Giriş yap</AuthLink>
        </p>
      }
    >
      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit}>
        <AuthField
          label="Ad Soyad"
          name="name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder="Ahmet Yılmaz"
          autoComplete="name"
        />
        <AuthField
          label="E-posta"
          type="email"
          name="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="ornek@email.com"
          autoComplete="email"
        />
        <AuthField
          label="Telefon (opsiyonel)"
          type="tel"
          name="phone"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="0532 000 00 00"
          required={false}
          autoComplete="tel"
        />
        <AuthField
          label="Şifre"
          type="password"
          name="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          placeholder="En az 6 karakter"
          minLength={6}
          autoComplete="new-password"
        />
        <AuthButton loading={loading} loadingText="Kaydediliyor...">
          Kayıt ol
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
