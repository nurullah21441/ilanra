"use client";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <div style={{
        background: "#111", borderRadius: 20,
        padding: "clamp(1.5rem,4vw,2.5rem) clamp(1.5rem,4vw,3rem)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: "1.5rem", flexWrap: "wrap",
      }}>
        <div>
          <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(18px,3vw,24px)", fontWeight: 800, color: "#fff", marginBottom: 8, letterSpacing: -0.5 }}>
            İlanını şimdi ver — tamamen ücretsiz
          </h3>
          <p style={{ fontSize: 14, color: "#777", lineHeight: 1.5 }}>
            Binlerce alıcıya ulaş. Kayıt ol, ilanını ekle, sat.
          </p>
        </div>
        <Link href="/ilan-ver" className="cta-btn" style={{
          display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0,
          padding: "13px 28px", background: "#E63946", color: "#fff",
          borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 15,
          boxShadow: "0 4px 20px rgba(230,57,70,.4)", transition: "background .15s",
        }}
        >İlan ver →</Link>
      </div>
    </section>
  );
}
