interface LogoProps {
  /** Yazı boyutu (px) */
  size?: number;
  /** @deprecated size kullanın */
  height?: number;
  variant?: "default" | "light";
  className?: string;
}

function resolveSize(size?: number, height?: number) {
  if (size != null) return size;
  if (height != null) return Math.round(height * 0.95);
  return 26;
}

export default function Logo({
  size,
  height,
  variant = "default",
  className,
}: LogoProps) {
  const fontSize = resolveSize(size, height);

  return (
    <span
      className={`site-logo site-logo--${variant}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label="ilanra"
      style={{ fontSize }}
    >
      ilanra
    </span>
  );
}
