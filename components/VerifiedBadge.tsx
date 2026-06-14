export default function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span className={`verified-badge verified-badge--${size}`} title="E-posta doğrulanmış satıcı">
      ✓ Doğrulanmış
    </span>
  );
}
