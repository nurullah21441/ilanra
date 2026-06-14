"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthLayout, { AuthLink } from "@/components/auth/AuthLayout";

function EpostaDogrulaContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") {
    return (
      <AuthLayout variant="forgot" title="Doğrulanıyor..." subtitle="">
        <p style={{ fontSize: 14, color: "#999", textAlign: "center" }}>E-posta adresiniz doğrulanıyor...</p>
      </AuthLayout>
    );
  }

  if (status === "invalid") {
    return (
      <AuthLayout variant="forgot" title="Geçersiz bağlantı" subtitle="Doğrulama linki eksik veya hatalı.">
        <AuthLink href="/profil">Profilime dön</AuthLink>
      </AuthLayout>
    );
  }

  if (status === "error") {
    return (
      <AuthLayout variant="forgot" title="Bağlantı süresi dolmuş" subtitle="Doğrulama linki geçersiz veya süresi dolmuş. Yeni link isteyebilirsiniz.">
        <AuthLink href="/profil">Profilden yeni link gönder</AuthLink>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="forgot" title="E-posta doğrulandı" subtitle="Hesabınız başarıyla doğrulandı. Artık ilan verebilir ve mesaj gönderebilirsiniz.">
      <AuthLink href="/ilan-ver">İlan ver</AuthLink>
      <div style={{ height: 10 }} />
      <AuthLink href="/profil">Profilime git</AuthLink>
    </AuthLayout>
  );
}

export default function EpostaDogrulaPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Yükleniyor...</div>}>
      <EpostaDogrulaContent />
    </Suspense>
  );
}
