interface LogoProps {
  height?: number;
  variant?: "default" | "light";
  showText?: boolean;
  className?: string;
}

const BRAND_RED = "#E53935";

function LogoIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="20" y="20" width="140" height="140" rx="36" fill={BRAND_RED} />
      <circle cx="90" cy="55" r="10" fill="#FFFFFF" />
      <path
        d="M82 82 C82 76 86 72 90 72 C94 72 98 76 98 82 V128 C98 136 93 141 90 141 C87 141 82 136 82 128 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export default function Logo({
  height = 36,
  variant = "default",
  showText = true,
  className,
}: LogoProps) {
  const textColor = variant === "light" ? "#FFFFFF" : "#111111";

  if (!showText) {
    return (
      <span className={className} style={{ display: "inline-flex", lineHeight: 0 }}>
        <LogoIcon size={height} />
      </span>
    );
  }

  const width = Math.round(height * (760 / 180));

  return (
    <span className={className} style={{ display: "inline-flex", lineHeight: 0 }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 760 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ilanra"
      >
        <rect x="20" y="20" width="140" height="140" rx="36" fill={BRAND_RED} />
        <circle cx="90" cy="55" r="10" fill="#FFFFFF" />
        <path
          d="M82 82 C82 76 86 72 90 72 C94 72 98 76 98 82 V128 C98 136 93 141 90 141 C87 141 82 136 82 128 Z"
          fill="#FFFFFF"
        />
        <text
          x="190"
          y="118"
          fill={textColor}
          fontFamily="Inter, Arial, sans-serif"
          fontSize="72"
          fontWeight="800"
          letterSpacing="-2"
        >
          lanra
        </text>
      </svg>
    </span>
  );
}
