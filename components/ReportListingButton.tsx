"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginPath } from "@/lib/auth-url";

const REASONS = [
  { value: "spam", label: "Spam / Tekrarlayan ilan" },
  { value: "fake", label: "Sahte veya yanıltıcı" },
  { value: "inappropriate", label: "Uygunsuz içerik" },
  { value: "scam", label: "Dolandırıcılık şüphesi" },
  { value: "other", label: "Diğer" },
] as const;

export default function ReportListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("spam");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user) {
      setLoading(false);
      router.push(loginPath(`/ilan/${listingId}`));
      return;
    }

    const res = await fetch(`/api/listings/${listingId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, details: details.trim() || undefined }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Şikayet gönderilemedi");
      return;
    }

    setDone(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setDone(false); setError(""); }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          color: "#999",
          fontSize: 12.5,
          cursor: "pointer",
          fontFamily: "inherit",
          marginTop: 8,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        İlanı şikayet et
      </button>

      {open && (
        <div
          className="modal-overlay"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Şikayet alındı</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.55, marginBottom: 16 }}>
                  Bildiriminiz incelenecek. Teşekkürler.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 9,
                    border: "none",
                    background: "var(--brand)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Tamam
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>İlanı şikayet et</h3>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Neden şikayet ediyorsunuz?</p>

                {error && (
                  <div style={{ background: "var(--brand-soft)", color: "#dc2626", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 9,
                        border: reason === r.value ? "1px solid var(--brand)" : "0.5px solid #e8e8e5",
                        background: reason === r.value ? "var(--brand-soft)" : "#fff",
                        cursor: "pointer",
                        fontSize: 13.5,
                      }}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        style={{ accentColor: "var(--brand)" }}
                      />
                      {r.label}
                    </label>
                  ))}
                </div>

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Ek açıklama (opsiyonel)"
                  maxLength={500}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 9,
                    border: "0.5px solid #e8e8e5",
                    fontSize: 13.5,
                    fontFamily: "inherit",
                    resize: "vertical",
                    boxSizing: "border-box",
                    marginBottom: 16,
                  }}
                />

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: 9,
                      border: "0.5px solid #e8e8e5",
                      background: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: 9,
                      border: "none",
                      background: "var(--brand)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: loading ? "wait" : "pointer",
                      fontFamily: "inherit",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? "Gönderiliyor..." : "Gönder"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
