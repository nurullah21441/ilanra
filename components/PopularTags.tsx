"use client";
import Link from "next/link";

const tags = ["iPhone", "Kiralık daire", "Otomobil", "Bisiklet", "Laptop", "PS5"];

export default function PopularTags() {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: 12.5, color: "#aaa", alignSelf: "center" }}>Popüler:</span>
      {tags.map(term => (
        <Link key={term} href={`/ilanlar?q=${encodeURIComponent(term)}`} className="trust-pill" style={{
          padding: "5px 13px", borderRadius: 100,
          background: "#f5f5f3", border: "0.5px solid #e8e8e5",
          fontSize: 12.5, color: "#555", textDecoration: "none",
          transition: "all 0.15s",
        }}>{term}</Link>
      ))}
    </div>
  );
}
