"use client";

import { useState } from "react";
import Link from "next/link";

type VerifyEmailPromptProps = {
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

export default function VerifyEmailPrompt({
  title = "E-postanı doğrula",
  subtitle = "İlan vermek ve mesaj göndermek için e-posta adresini doğrulaman gerekiyor. 1 dakikadan kısa sürer.",
  compact = false,
}: VerifyEmailPromptProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [devVerifyUrl, setDevVerifyUrl] = useState("");

  async function sendVerification() {
    setLoading(true);
    setMessage("");
    setDevVerifyUrl("");

    const res = await fetch("/api/auth/send-verification", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Doğrulama bağlantısı gönderilemedi.");
      return;
    }

    setMessage(data.message || "Doğrulama bağlantısı e-posta adresine gönderildi.");
    if (data.devVerifyUrl) setDevVerifyUrl(data.devVerifyUrl);
  }

  return (
    <div className={`verify-email-prompt${compact ? " verify-email-prompt--compact" : ""}`}>
      <div className="verify-email-prompt-icon" aria-hidden>✉️</div>
      <div className="verify-email-prompt-body">
        <h2 className="verify-email-prompt-title">{title}</h2>
        <p className="verify-email-prompt-subtitle">{subtitle}</p>

        {message && <p className="verify-email-prompt-message">{message}</p>}
        {devVerifyUrl && (
          <p className="verify-email-prompt-dev">
            Geliştirme modu — doğrulama linki:{" "}
            <a href={devVerifyUrl}>{devVerifyUrl}</a>
          </p>
        )}

        <div className="verify-email-prompt-actions">
          <button
            type="button"
            onClick={sendVerification}
            disabled={loading}
            className="verify-email-prompt-btn"
          >
            {loading ? "Gönderiliyor..." : "Doğrulama linki gönder"}
          </button>
          <Link href="/profil" className="verify-email-prompt-link">
            Profilime git
          </Link>
        </div>
      </div>
    </div>
  );
}
