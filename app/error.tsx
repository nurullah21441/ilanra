"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Bir hata oluştu</h1>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 24, lineHeight: 1.6 }}>
            Beklenmeyen bir sorun yaşandı. Lütfen tekrar dene.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{ padding: "12px 24px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
            >
              Tekrar dene
            </button>
            <Link href="/" style={{ display: "inline-block", padding: "12px 24px", background: "#fff", color: "#333", borderRadius: 8, textDecoration: "none", fontWeight: 500, fontSize: 15, border: "1px solid var(--border)" }}>
              Ana sayfa
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
