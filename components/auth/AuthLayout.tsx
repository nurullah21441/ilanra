import Link from "next/link";
import Logo from "@/components/Logo";

type AuthVariant = "login" | "register" | "forgot";

const BRAND_COPY: Record<AuthVariant, { headline: string; bullets: string[] }> = {
  login: {
    headline: "İlanlarına tek yerden ulaş",
    bullets: ["Favori ilanlarını kaydet", "Mesajlarını takip et", "İlanlarını kolayca yönet"],
  },
  register: {
    headline: "Ücretsiz hesap oluştur",
    bullets: ["Dakikalar içinde ilan ver", "Güvenli alıcı-satıcı iletişimi", "Tüm kategorilerde binlerce ilan"],
  },
  forgot: {
    headline: "Hesabını güvende tut",
    bullets: ["E-posta ile hızlı doğrulama", "Güçlü şifre belirle", "Anında giriş yap"],
  },
};

interface AuthLayoutProps {
  variant: AuthVariant;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  step?: number;
  stepLabels?: string[];
}

export default function AuthLayout({
  variant,
  title,
  subtitle,
  children,
  footer,
  step,
  stepLabels,
}: AuthLayoutProps) {
  const copy = BRAND_COPY[variant];

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-brand-panel" aria-hidden="true">
          <Link href="/" className="auth-brand-logo">
            <Logo size={32} variant="light" />
          </Link>
          <h2 className="auth-brand-headline">{copy.headline}</h2>
          <ul className="auth-brand-list">
            {copy.bullets.map((item) => (
              <li key={item}>
                <span className="auth-brand-check" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-top-bar">
              <Link href="/" className="auth-form-logo" aria-label="Ana sayfaya dön">
                <Logo size={28} />
              </Link>
              <Link href="/" className="auth-home-link">Ana sayfa</Link>
            </div>

            {stepLabels && step !== undefined && (
              <div className="auth-steps" role="list" aria-label="İlerleme">
                {stepLabels.map((label, i) => (
                  <div
                    key={label}
                    role="listitem"
                    className={`auth-step${i <= step ? " auth-step--active" : ""}${i < step ? " auth-step--done" : ""}`}
                  >
                    <span className="auth-step-dot">{i < step ? "✓" : i + 1}</span>
                    <span className="auth-step-label">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {title && (
              <header className="auth-header">
                <h1 className="auth-title">{title}</h1>
                {subtitle && <p className="auth-subtitle">{subtitle}</p>}
              </header>
            )}

            {children}

            {footer && <div className="auth-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-error" role="alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {children}
    </div>
  );
}

interface AuthFieldProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

export function AuthField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = true,
  minLength,
  autoComplete,
}: AuthFieldProps) {
  return (
    <div className="auth-field">
      <label htmlFor={name} className="auth-label">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className="auth-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
      />
    </div>
  );
}

interface AuthButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  type?: "submit" | "button";
  disabled?: boolean;
}

export function AuthButton({ children, loading, loadingText, type = "submit", disabled }: AuthButtonProps) {
  return (
    <button type={type} className="auth-btn" disabled={disabled || loading}>
      {loading ? (
        <>
          <span className="auth-spinner" aria-hidden="true" />
          {loadingText ?? "Bekleyin..."}
        </>
      ) : children}
    </button>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="auth-link">{children}</Link>;
}
