"use client";

export function notifyMessagesUpdated() {
  window.dispatchEvent(new Event("ilanra:messages-updated"));
}

export function formatUnreadCount(count: number) {
  if (count <= 0) return "";
  if (count > 99) return "99+";
  return String(count);
}

interface UnreadBadgeProps {
  count: number;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

export function UnreadBadge({ count, size = "md", style }: UnreadBadgeProps) {
  if (count <= 0) return null;
  const dim = size === "sm" ? 16 : 18;
  const fontSize = size === "sm" ? 9 : 10;
  return (
    <span
      style={{
        position: "absolute",
        top: size === "sm" ? -4 : -5,
        right: size === "sm" ? -4 : -5,
        minWidth: dim,
        height: dim,
        padding: "0 4px",
        borderRadius: 100,
        background: "var(--brand)",
        color: "#fff",
        fontSize,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #fff",
        lineHeight: 1,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {formatUnreadCount(count)}
    </span>
  );
}
