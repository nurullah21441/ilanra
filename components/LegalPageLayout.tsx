import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  title: string;
  subtitle?: string;
  updatedAt?: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, subtitle, updatedAt, children }: Props) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#f7f7f5" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(1.5rem, 4vw, 2.5rem) 1rem 4rem" }}>
          <header style={{ marginBottom: "1.75rem" }}>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "clamp(28px, 4vw, 36px)",
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: subtitle ? 10 : 0,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 15, color: "#777", lineHeight: 1.6, maxWidth: 560 }}>
                {subtitle}
              </p>
            )}
            {updatedAt && (
              <p style={{ fontSize: 12.5, color: "#aaa", marginTop: 12 }}>
                Son güncelleme: {updatedAt}
              </p>
            )}
          </header>

          <article className="legal-content" style={{
            background: "#fff",
            borderRadius: 18,
            border: "0.5px solid #e8e8e5",
            padding: "clamp(1.5rem, 4vw, 2.5rem)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          }}>
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
