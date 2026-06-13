import Link from "next/link";
import Image from "next/image";
import { getCategoryStyle } from "@/lib/categoryStyles";
import {
  formatListingPrice,
  isFreshListing,
  type HeroSpotlightListing,
} from "@/lib/hero-spotlight";

interface Props {
  totalListings: number;
  spotlightListings?: HeroSpotlightListing[];
}

const TRUST = [
  { icon: "⚡", text: "2 dakikada ilan ver" },
  { icon: "💸", text: "Komisyonsuz" },
  { icon: "🔒", text: "Güvenli mesajlaşma" },
  { icon: "📱", text: "Mobilde kolay" },
];

const CARD_POSITIONS = [
  "home-hero-card--1",
  "home-hero-card--2",
  "home-hero-card--3",
] as const;

export default function HomeHero({ totalListings, spotlightListings = [] }: Props) {
  return (
    <section className="home-hero">
      <div className="home-hero-inner">
        <div className="home-hero-content">
          <span className="home-hero-badge">Türkiye&apos;nin yeni ilan platformu</span>
          <h1 className="home-hero-title">
            Satmak istediğin her şeyi
            <span className="home-hero-highlight"> ücretsiz ilan ver</span>
          </h1>
          <p className="home-hero-sub">
            {totalListings > 0
              ? `${totalListings.toLocaleString("tr-TR")} aktif ilan arasında yerini al — fotoğraf yükle, fiyatı yaz, yayına gir.`
              : "İlk ilanı sen ver, platformu birlikte büyütelim. Fotoğraf yükle, fiyatı yaz, hemen yayına gir."}
          </p>

          <div className="home-hero-actions">
            <Link href="/ilan-ver" className="home-hero-cta-primary">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" />
              </svg>
              Ücretsiz ilan ver
            </Link>
            <Link href="/ilanlar" className="home-hero-cta-secondary">
              İlanları keşfet
            </Link>
          </div>

          <div className="home-hero-trust">
            {TRUST.map((t) => (
              <span key={t.text} className="home-hero-trust-pill">
                <span>{t.icon}</span> {t.text}
              </span>
            ))}
          </div>
        </div>

        {spotlightListings.length > 0 && (
          <div className="home-hero-visual">
            {spotlightListings.slice(0, 3).map((listing, i) => {
              const img = listing.images[0]?.url;
              const style = getCategoryStyle(listing.category.slug, 20);
              const isNew = isFreshListing(listing.createdAt);

              return (
                <Link
                  key={listing.id}
                  href={`/ilan/${listing.id}`}
                  className={`home-hero-card ${CARD_POSITIONS[i]}`}
                >
                  <div
                    className="home-hero-card-thumb"
                    style={!img ? { background: style.gradient, color: style.color } : undefined}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={listing.title}
                        width={48}
                        height={48}
                        sizes="48px"
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    ) : (
                      <span className="home-hero-card-thumb-fallback">{style.iconNode}</span>
                    )}
                  </div>
                  <div className="home-hero-card-info">
                    <div className="home-hero-card-label">{listing.category.name}</div>
                    <div className="home-hero-card-title">{listing.title}</div>
                    <div className="home-hero-card-price">₺{formatListingPrice(listing.price)}</div>
                  </div>
                  {isNew && <span className="home-hero-card-tag">YENİ</span>}
                  {!isNew && listing.isFeatured && (
                    <span className="home-hero-card-tag home-hero-card-tag--hot">Öne çıkan</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
