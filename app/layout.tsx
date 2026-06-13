import type { Metadata, Viewport } from "next";
import "./globals.css";
import FloatingIlanCTA from "@/components/FloatingIlanCTA";

export const metadata: Metadata = {
  title: { default: "ilanra – Türkiye'nin Modern İlan Platformu", template: "%s | ilanra" },
  description: "Milyonlarca ilan, gerçek fiyatlar, güvenli alışveriş. Sahibinden doğrudan.",
  keywords: ["ilan", "satılık", "kiralık", "araç", "emlak", "elektronik", "ilanra"],
  openGraph: {
    title: "ilanra – Türkiye'nin Modern İlan Platformu",
    description: "Milyonlarca ilan, gerçek fiyatlar, güvenli alışveriş.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <FloatingIlanCTA />
      </body>
    </html>
  );
}
