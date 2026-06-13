"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

type AdminTab = "genel" | "ilanlar" | "kullanicilar" | "sikayetler";

interface AdminUser {
  name: string;
  email: string;
}

interface AdminShellProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const NAV: { id: AdminTab; label: string; icon: string }[] = [
  { id: "genel", label: "Genel Bakış", icon: "📊" },
  { id: "ilanlar", label: "İlanlar", icon: "📋" },
  { id: "sikayetler", label: "Şikayetler", icon: "🚩" },
  { id: "kullanicilar", label: "Kullanıcılar", icon: "👥" },
];

export default function AdminShell({ activeTab, onTabChange, title, subtitle, children }: AdminShellProps) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser({ name: d.user.name, email: d.user.email }); });
  }, []);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={24} variant="light" />
          </Link>
          <div style={{ marginTop: 10, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b" }}>
            Yönetim Paneli
          </div>
        </div>

        {user && (
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {user.name[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11.5, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email}
                </div>
              </div>
            </div>
            <span
              style={{
                display: "inline-block",
                marginTop: 8,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
                background: "rgba(217,45,38,0.2)",
                color: "#fca5a5",
                padding: "3px 8px",
                borderRadius: 100,
              }}
            >
              ADMIN
            </span>
          </div>
        )}

        <nav style={{ flex: 1, padding: "0.75rem", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  color: active ? "#fff" : "#94a3b8",
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  width: "100%",
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 4 }}>
          <Link
            href="/profil"
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              fontSize: 13,
              color: "#94a3b8",
              textDecoration: "none",
            }}
          >
            👤 Hesabım
          </Link>
          <Link
            href="/"
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              fontSize: 13,
              color: "#94a3b8",
              textDecoration: "none",
            }}
          >
            ← Siteye dön
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <header style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(22px, 5vw, 26px)", fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>
            {title}
          </h1>
          {subtitle && <p style={{ fontSize: 14, color: "var(--ink-light)" }}>{subtitle}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}

export type { AdminTab };
