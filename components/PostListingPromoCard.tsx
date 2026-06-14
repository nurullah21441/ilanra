import Link from "next/link";

type Variant = "grid" | "banner" | "compact";

interface Props {
  variant?: Variant;
}

export default function PostListingPromoCard({ variant = "grid" }: Props) {
  if (variant === "banner") {
    return (
      <Link href="/ilan-ver" className="promo-banner">
        <div className="promo-banner-glow" />
        <div className="promo-banner-content">
          <div>
            <div className="promo-banner-eyebrow">Sen de sat</div>
            <div className="promo-banner-title">Ücretsiz ilan ver, binlerce alıcıya ulaş</div>
            <div className="promo-banner-sub">Komisyon yok · Anında yayın · Mesajla güvenli satış</div>
          </div>
          <span className="promo-banner-btn">İlan ver →</span>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href="/ilan-ver" className="promo-card promo-card--compact">
        <span className="promo-card-icon">+</span>
        <span className="promo-card-title">İlan ver</span>
        <span className="promo-card-sub">Ücretsiz</span>
      </Link>
    );
  }

  return (
    <Link href="/ilan-ver" className="promo-card">
      <div className="promo-card-bg" />
      <div className="promo-card-body">
        <div className="promo-card-icon-wrap">+</div>
        <h3 className="promo-card-heading">Sen de ilan ver</h3>
        <p className="promo-card-text">
          2 dakikada yayına al. Komisyon yok, sınır yok.
        </p>
        <span className="promo-card-cta">Hemen başla →</span>
      </div>
    </Link>
  );
}
