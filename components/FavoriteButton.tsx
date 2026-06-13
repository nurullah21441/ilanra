"use client";

interface FavoriteButtonProps {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: "sm" | "md";
}

export default function FavoriteButton({ active, onClick, size = "sm" }: FavoriteButtonProps) {
  const dim = size === "sm" ? 34 : 40;
  const icon = size === "sm" ? 17 : 19;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "Favorilerden çıkar" : "Favorilere ekle"}
      aria-pressed={active}
      className={`fav-btn tap-btn${active ? " fav-btn--active" : ""}`}
      style={{
        position: "absolute",
        top: size === "sm" ? 8 : 10,
        right: size === "sm" ? 8 : 10,
        width: dim,
        height: dim,
        borderRadius: "50%",
        background: "#fff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 6px rgba(15, 23, 42, 0.14)",
        zIndex: 2,
      }}
    >
      <svg
        className="fav-btn-icon"
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill={active ? "var(--brand)" : "none"}
        stroke={active ? "var(--brand)" : "#64748b"}
        strokeWidth={active ? 0 : 1.75}
        aria-hidden
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
