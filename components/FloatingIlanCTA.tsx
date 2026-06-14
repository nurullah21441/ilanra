"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDE_ON = ["/ilan-ver", "/giris", "/kayit", "/admin", "/ilan/"];

export default function FloatingIlanCTA() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <Link href="/ilan-ver" className="floating-ilan-cta" aria-label="Ücretsiz ilan ver">
      <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" />
      </svg>
      <span>İlan ver</span>
    </Link>
  );
}
