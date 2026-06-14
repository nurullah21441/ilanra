import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#e8e8e5", fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: 8 }}>404</div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sayfa bulunamadı</h1>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 24, lineHeight: 1.6 }}>
            Aradığın sayfa kaldırılmış veya hiç var olmamış olabilir.
          </p>
          <Link href="/" style={{ display: "inline-block", padding: "12px 28px", background: "var(--brand)", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </>
  );
}
