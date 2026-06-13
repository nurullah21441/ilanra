"use client";
import Link from "next/link";
import { getCategoryStyle } from "@/lib/categoryStyles";

interface Category { id: string; name: string; icon: string; slug: string; }

export default function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  const { bg, color, gradient, iconNode } = getCategoryStyle(cat.slug, 26);

  return (
    <Link href="/ilan-ver" style={{ textDecoration: "none" }}>
      <div className="cat-card" style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
        padding: "16px 8px 13px", borderRadius: 14, cursor: "pointer",
        animation: `fadeUp 0.35s ease ${index * 0.04}s both`,
      }}>
        <div style={{ width: 50, height: 50, borderRadius: 13, background: gradient, color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `inset 0 0 0 1px ${bg}` }}>
          {iconNode}
        </div>
        <span style={{ fontSize: 11.5, color: "#333", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{cat.name}</span>
      </div>
    </Link>
  );
}
