"use client";
import Link from "next/link";

export default function HeroButtons() {
  return (
    <Link href="/ilan-ver" className="hero-cta" style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "15px 32px", borderRadius: 14, textDecoration: "none",
      fontWeight: 700, fontSize: 16,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
      Ücretsiz ilan ver
    </Link>
  );
}
