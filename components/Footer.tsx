import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE_EMAIL } from "@/lib/site";

export default function () {
  const cats = [
    { label: "Araçlar", slug: "araclar" },
    { label: "Emlak", slug: "emlak" },
    { label: "Elektronik", slug: "elektronik" },
    { label: "Giyim", slug: "giyim" },
    { label: "Ev & Yaşam", slug: "ev-yasam" },
    { label: "Tümü →", slug: "" },
  ];

  const account = [
    { label: "Giriş yap", href: "/giris" },
    { label: "Kayıt ol", href: "/kayit" },
    { label: "İlan ver", href: "/ilan-ver" },
    { label: "İlanlarım", href: "/ilanlarim" },
    { label: "Favoriler", href: "/favoriler" },
    { label: "Mesajlar", href: "/mesajlar" },
  ];

  const support = [
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
    { label: "Kullanım Şartları", href: "/kullanim-sartlari" },
    { label: "Çerez Politikası", href: "/cerez-politikasi" },
    { label: "İletişim", href: "/iletisim" },
  ];

  const linkStyle = {
    fontSize: 13.5, color: "#666", textDecoration: "none",
    transition: "color .15s", display: "block",
  };

  return (
    <footer style={{ background: "#111", padding: "48px 1.5rem 28px", marginTop: 0 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* TOP GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "clamp(24px,4vw,48px)", marginBottom: 40 }} className="-grid">

          {/* BRAND */}
          <div>
            <Link href="/" style={{ display: "inline-block", marginBottom: 12, textDecoration: "none" }}>
              <Logo height={38} variant="light" />
            </Link>
            <p style={{ fontSize: 13.5, color: "#666", lineHeight: 1.65, maxWidth: 220, marginBottom: 20 }}>
              Türkiye&#39;nin modern ilan platformu. Milyonlarca ürün, gerçek fiyatlar, güvenli alışveriş.
            </p>
            <a href={`mailto:${SITE_EMAIL}`} className="footer-email" style={{ fontSize: 13, textDecoration: "none", display: "block", marginBottom: 16 }}>
              {SITE_EMAIL}
            </a>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Ücretsiz ilan ver", "Komisyonsuz satış", "Güvenli alışveriş"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#555", fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0, display: "inline-block" }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* KATEGORİLER */}
          <div>
            <div style={{ fontSize: 11, color: "#444", fontWeight: 700, letterSpacing: .6, textTransform: "uppercase", marginBottom: 16 }}>Kategoriler</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cats.map(c => (
                <Link key={c.label} href={c.slug ? `/ilanlar?category=${c.slug}` : "/ilanlar"} className="footer-link" style={linkStyle}
                >{c.label}</Link>
              ))}
            </div>
          </div>

          {/* HESAP */}
          <div>
            <div style={{ fontSize: 11, color: "#444", fontWeight: 700, letterSpacing: .6, textTransform: "uppercase", marginBottom: 16 }}>Hesap</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {account.map(a => (
                <Link key={a.href} href={a.href} className="footer-link" style={linkStyle}
                >{a.label}</Link>
              ))}
            </div>
          </div>

          {/* DESTEK */}
          <div>
            <div style={{ fontSize: 11, color: "#444", fontWeight: 700, letterSpacing: .6, textTransform: "uppercase", marginBottom: 16 }}>Destek</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {support.map(s => (
                <Link key={s.label} href={s.href} className="footer-link" style={linkStyle}
                >{s.label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ height: .5, background: "#222", marginBottom: 24 }} />

        {/* BOTTOM */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 12.5, color: "#444" }}>
            © 2025 <span style={{ color: "#E63946" }}>ilanra.com</span> — Tüm hakları saklıdır.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "🇹🇷 Türkiye" },
              { label: "SSL Güvenli" },
            ].map(b => (
              <div key={b.label} style={{ padding: "5px 12px", borderRadius: 8, background: "#1a1a1a", border: ".5px solid #2a2a2a", fontSize: 11, color: "#444", fontWeight: 600 }}>
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-link { transition: color .15s; }
        .footer-link:hover { color: #fff !important; }
        .footer-email { color: #888; transition: color .15s; }
        .footer-email:hover { color: #fff; }
        @media (max-width: 768px) {
          .-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
