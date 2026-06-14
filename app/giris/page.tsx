"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout, { AuthError, AuthField, AuthButton, AuthLink } from "@/components/auth/AuthLayout";

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
    <AuthLayout
      variant="login"
      title="Giriş yap"
      subtitle={redirect !== "/" ? "İlan vermek için giriş yapman gerekiyor." : "Hesabına giriş yap ve ilanlarına devam et."}
      footer={
        <>
          <Link href="/sifremi-unuttum" className="auth-muted-link">Şifremi unuttum</Link>
          <p>
            Hesabın yok mu? <AuthLink href="/kayit">Kayıt ol</AuthLink>
          </p>
        </>
      }
    >
      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit}>
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
          label="Şifre"
          type="password"
          name="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <AuthButton loading={loading} loadingText="Giriş yapılıyor...">
          Giriş yap
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default function GirisPage() {
  return (
    <Suspense>
      <GirisForm />
    </Suspense>
  );
}
