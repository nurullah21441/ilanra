"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getCategoryStyle } from "@/lib/categoryStyles";
import { UnreadBadge } from "@/lib/messages-ui";
import { loginPath } from "@/lib/auth-url";

interface User { id: string; name: string; email: string; role: string; }
interface Category { id: string; name: string; icon: string; slug: string; }
interface SearchResult {
  id: string; title: string; price: number; city: string;
  images: { url: string }[]; category: { name: string; slug: string };
}

const searchHints = ["iPhone 15", "Kiralık daire", "Clio", "PlayStation 5", "MacBook"];
const QUICK_CAT_SLUGS = ["emlak", "araclar", "elektronik", "giyim", "ev-yasam", "oyun-hobi", "is-ilanlari", "hizmetler"];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const oyunHobiCatRef = useRef<HTMLAnchorElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchWidth, setSearchWidth] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategorySlug = searchParams.get("category");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }

    function refreshUnread() {
      fetch("/api/messages/unread-count")
        .then((r) => r.json())
        .then((d) => setUnreadMessages(d.count || 0))
        .catch(() => {});
    }

    refreshUnread();
    const interval = setInterval(refreshUnread, 30000);
    const onUpdate = () => refreshUnread();
    window.addEventListener("ilanra:messages-updated", onUpdate);
    window.addEventListener("focus", onUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("ilanra:messages-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetch("/api/messages/unread-count")
        .then((r) => r.json())
        .then((d) => setUnreadMessages(d.count || 0))
        .catch(() => {});
    }
  }, [user, pathname]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { setMobileOpen(false); setMenuOpen(false); setCatOpen(false); setSearchOpen(false); }, [pathname]);

  useEffect(() => {
    if (mobileOpen) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [mobileOpen]);

  const mobileNavLinks = [
    { href: "/profil", label: "Profilim" },
    { href: "/ilanlarim", label: "İlanlarım" },
    { href: "/mesajlar", label: "Mesajlar" },
    { href: "/favoriler", label: "Favoriler" },
  ];

  const quickCategories = QUICK_CAT_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is Category => Boolean(c));

  const mobileCategories = [
    ...quickCategories,
    ...categories.filter((c) => !QUICK_CAT_SLUGS.includes(c.slug)),
  ];

  useEffect(() => {
    function syncSearchWidth() {
      if (window.innerWidth < 769) {
        setSearchWidth(null);
        return;
      }
      const logo = logoRef.current;
      const cat = oyunHobiCatRef.current;
      if (!logo || !cat) return;
      const next = Math.round(cat.getBoundingClientRect().right - logo.getBoundingClientRect().right - 16);
      if (next > 160) setSearchWidth(next);
    }

    syncSearchWidth();
    const ro = new ResizeObserver(syncSearchWidth);
    if (catRef.current) ro.observe(catRef.current);
    if (logoRef.current) ro.observe(logoRef.current);
    window.addEventListener("resize", syncSearchWidth);
    requestAnimationFrame(syncSearchWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncSearchWidth);
    };
  }, [quickCategories.length, categories.length]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null); router.push("/"); router.refresh();
  }

  function handleSearchChange(val: string) {
    setSearchVal(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    setSearching(true);
    setSearchOpen(true);
    searchTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/listings?q=${encodeURIComponent(val)}&limit=6`);
      const data = await res.json();
      setSearchResults(data.listings || []);
      setSearching(false);
    }, 300);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchVal.trim()) return;
    setSearchOpen(false);
    router.push(`/ilanlar?q=${encodeURIComponent(searchVal.trim())}`);
  }

  const categoryMegaMenu = catOpen && (
    <div
      onMouseLeave={() => setCatOpen(false)}
      style={{
        position: "absolute",
        top: "calc(100% + 2px)",
        left: "auto",
        right: "1.25rem",
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: 8,
        width: 440,
        maxHeight: "min(70vh, 520px)",
        overflowY: "auto",
        boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
        padding: "16px",
        zIndex: 200,
        animation: "dropDown .18s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Tüm Kategoriler</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {categories.map((cat) => {
          const c = getCategoryStyle(cat.slug, 20);
          return (
            <Link key={cat.id} href={`/kategori/${cat.slug}`} onClick={() => setCatOpen(false)} style={{ textDecoration: "none" }}>
              <div className="cat-hover-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 8, transition: "background .12s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = c.bg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div className="cat-hover-icon" style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: c.gradient, color: c.color,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {c.iconNode}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{cat.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div style={{ borderTop: "1px solid #f0f0ee", marginTop: 8, paddingTop: 8 }}>
        <Link href="/ilanlar" onClick={() => setCatOpen(false)} style={{ display: "block", textAlign: "center", padding: "8px", fontSize: 13, color: "var(--brand)", fontWeight: 600, textDecoration: "none" }}>
          Tüm ilanları gör →
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <header className={`site-navbar${scrolled ? " site-navbar--scrolled" : ""}`}>
        {/* ÜST SATIR: logo + arama + aksiyonlar */}
        <div className="navbar-top">
          <Link href="/" className="navbar-logo" ref={logoRef}>
            <Logo size={32} />
          </Link>

          <div
            className="navbar-search-wrap"
            ref={searchRef}
            style={searchWidth ? { width: searchWidth, maxWidth: searchWidth } : undefined}
          >
            <div className={`navbar-search-box${searchOpen ? " navbar-search-box--open" : ""}`}>
            <form onSubmit={handleSearchSubmit}>
              <div className={`navbar-search-form${searchOpen ? " navbar-search-form--open" : ""}`}>
                <svg width="16" height="16" viewBox="0 0 15 15" fill="none" style={{ marginLeft: 12, color: searchOpen ? "var(--brand)" : "#999", flexShrink: 0 }}>
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  className="navbar-search-input"
                  value={searchVal}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Ne arıyorsun? Araç, emlak, telefon..."
                />
                {searchVal && (
                  <button type="button" onClick={() => { setSearchVal(""); setSearchResults([]); setSearchOpen(false); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 18, padding: "0 8px", lineHeight: 1 }}>×</button>
                )}
                <button type="submit" className={`navbar-search-btn${searchVal.trim() || searchOpen ? "" : " navbar-search-btn--muted"}`}>Ara</button>
              </div>
            </form>

            {searchOpen && !searchVal.trim() && (
              <div className="navbar-search-panel" style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 8 }}>Popüler aramalar</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {searchHints.map((term) => (
                    <button key={term} type="button" onClick={() => { setSearchVal(term); handleSearchChange(term); }}
                      style={{ padding: "6px 10px", borderRadius: 4, border: "1px solid var(--border)", background: "#fafaf8", color: "#555", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                    >{term}</button>
                  ))}
                </div>
              </div>
            )}

            {searchOpen && searchVal.trim() && (
              <div className="navbar-search-panel">
                {searching ? (
                  <div style={{ padding: 16, textAlign: "center", color: "#aaa", fontSize: 13 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #f0f0ee", borderTopColor: "var(--brand)", animation: "spin .7s linear infinite", margin: "0 auto 6px" }} />
                    Aranıyor...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((r) => (
                      <Link key={r.id} href={`/ilan/${r.id}`} onClick={() => { setSearchOpen(false); setSearchVal(""); }} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", transition: "background .12s" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fafaf8"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <div style={{ width: 40, height: 32, borderRadius: 4, overflow: "hidden", background: "#f5f5f3", flexShrink: 0 }}>
                            {r.images[0] ? (
                              <img src={r.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📦</div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                            <div style={{ fontSize: 11.5, color: "#999", marginTop: 1 }}>{r.category.name} · {r.city}</div>
                          </div>
                          <div className="price-text" style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            ₺{r.price.toLocaleString("tr-TR")}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link href={`/ilanlar?q=${encodeURIComponent(searchVal)}`} onClick={() => setSearchOpen(false)} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "10px 12px", borderTop: "1px solid #f0f0ee", fontSize: 12.5, color: "var(--brand)", fontWeight: 600 }}>
                        &quot;{searchVal}&quot; için tüm sonuçlar →
                      </div>
                    </Link>
                  </>
                ) : (
                  <div style={{ padding: 16, textAlign: "center", color: "#aaa", fontSize: 13 }}>Sonuç bulunamadı</div>
                )}
              </div>
            )}
            </div>
          </div>

          <div className="navbar-actions">
            <Link href={user ? "/ilan-ver" : loginPath("/ilan-ver")} className="navbar-btn-primary m-only" style={{ height: 34, padding: "0 10px", fontSize: 12 }}>+ İlan</Link>
            {user ? (
              <>
                <Link href="/ilan-ver" className="navbar-btn-primary d-only">+ İlan ver</Link>
                <Link href="/mesajlar" className="navbar-icon-btn d-only" title="Mesajlar">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  <UnreadBadge count={unreadMessages} />
                </Link>
                <div ref={menuRef} style={{ position: "relative" }}>
                  <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="d-only" style={{
                    display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 8px 0 4px",
                    borderRadius: 4, border: "1px solid var(--border)", background: "#fff", cursor: "pointer", fontFamily: "inherit",
                  }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, color: "#222", fontWeight: 500, maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name.split(" ")[0]}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: "#aaa", transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                      <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                  {menuOpen && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#fff", border: "1px solid var(--border)", borderRadius: 8, minWidth: 200, boxShadow: "0 12px 40px rgba(0,0,0,.1)", overflow: "hidden", animation: "dropDown .15s ease" }}>
                      <div style={{ padding: "10px 14px", borderBottom: "1px solid #f0f0ee" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: 11.5, color: "#999", marginTop: 2 }}>{user.email}</div>
                      </div>
                      {user.role === "ADMIN" && (
                        <Link href="/admin" className="menu-item" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", fontSize: 13, color: "var(--brand)", fontWeight: 600, textDecoration: "none", background: "var(--brand-soft)" }}>
                          Kontrol Paneli
                        </Link>
                      )}
                      {[
                        { href: "/profil", label: "Profilim" },
                        { href: "/ilanlarim", label: "İlanlarım" },
                        { href: "/mesajlar", label: "Mesajlar" },
                        { href: "/favoriler", label: "Favoriler" },
                      ].map((item) => (
                        <Link key={item.href} href={item.href} className="menu-item" style={{ display: "flex", alignItems: "center", padding: "9px 14px", fontSize: 13, color: "#444", textDecoration: "none" }}>
                          {item.label}
                          {item.href === "/mesajlar" && unreadMessages > 0 && (
                            <span style={{ marginLeft: "auto", minWidth: 18, height: 18, borderRadius: 100, background: "var(--brand)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                              {unreadMessages > 99 ? "99+" : unreadMessages}
                            </span>
                          )}
                        </Link>
                      ))}
                      <button type="button" onClick={logout} className="menu-item" style={{ display: "flex", width: "100%", padding: "9px 14px", fontSize: 13, color: "#999", border: "none", borderTop: "1px solid #f0f0ee", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
                        Çıkış yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/giris" className="navbar-btn-outline d-only">Giriş yap</Link>
                <Link href="/kayit" className="navbar-btn-outline d-only">Kayıt ol</Link>
                <Link href={loginPath("/ilan-ver")} className="navbar-btn-primary">+ İlan ver</Link>
              </>
            )}

            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="m-only tap-btn" aria-label="Menü" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5, minWidth: 44, minHeight: 44 }}>
              <span style={{ display: "block", width: 22, height: 1.5, background: "#333", borderRadius: 2, transition: "transform .2s", transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 1.5, background: "#333", borderRadius: 2, opacity: mobileOpen ? 0 : 1, transition: "opacity .2s" }} />
              <span style={{ display: "block", width: 22, height: 1.5, background: "#333", borderRadius: 2, transition: "transform .2s", transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* ALT SATIR: yatay kategoriler (Sahibinden tarzı) */}
        <div className="navbar-cats d-only" ref={catRef} style={{ position: "relative" }}>
          <div className="navbar-cats-inner">
            {quickCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                ref={cat.slug === "oyun-hobi" ? oyunHobiCatRef : undefined}
                className={`navbar-cat-link${(pathname === "/ilanlar" && activeCategorySlug === cat.slug) || pathname === `/kategori/${cat.slug}` ? " navbar-cat-link--active" : ""}`}
              >
                {cat.name}
              </Link>
            ))}
            <button type="button" className="navbar-cat-all" onMouseEnter={() => setCatOpen(true)} onClick={() => setCatOpen((v) => !v)}>
              Tümü
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: catOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          {categoryMegaMenu}
        </div>

        {/* Mobil: yatay kaydırmalı kategori şeridi */}
        <div className="navbar-cats-mobile">
          <div className="navbar-cats-mobile-inner">
            {quickCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className={`navbar-cat-chip${
                  (pathname === "/ilanlar" && activeCategorySlug === cat.slug) || pathname === `/kategori/${cat.slug}`
                    ? " navbar-cat-chip--active"
                    : ""
                }`}
              >
                {cat.name}
              </Link>
            ))}
            <button
              type="button"
              className="navbar-cat-chip--all"
              onClick={() => setMobileOpen(true)}
              aria-label="Tüm kategorileri aç"
            >
              Tümü
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="navbar-mobile-panel">
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: "1rem" }}>
              <div className="navbar-search-form">
                <input className="navbar-search-input" value={searchVal} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Ne arıyorsun?" />
                <button type="submit" className="navbar-search-btn">Ara</button>
              </div>
            </form>
            <div className="mobile-cats-section">
              <div className="mobile-cats-section-title">Kategoriler ({mobileCategories.length})</div>
              <div className="mobile-cat-grid">
              {mobileCategories.map((cat) => {
                const c = getCategoryStyle(cat.slug, 18);
                return (
                  <Link key={cat.id} href={`/kategori/${cat.slug}`} onClick={() => setMobileOpen(false)} style={{ textDecoration: "none", minWidth: 0 }}>
                    <div className="mobile-cat-item" style={{ background: c.gradient }}>
                      <span style={{ color: c.color }}>{c.iconNode}</span>
                      <span className="mobile-cat-item-name">{cat.name}</span>
                    </div>
                  </Link>
                );
              })}
              </div>
            </div>
            <Link href="/ilanlar" onClick={() => setMobileOpen(false)} style={{ display: "block", textAlign: "center", padding: 10, marginBottom: "1rem", borderRadius: 4, fontSize: 13, color: "var(--brand)", fontWeight: 600, textDecoration: "none", background: "var(--brand-soft)" }}>
              Tüm ilanları gör →
            </Link>
            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/ilan-ver" onClick={() => setMobileOpen(false)} className="navbar-btn-primary" style={{ justifyContent: "center" }}>+ İlan ver</Link>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {mobileNavLinks.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{ position: "relative", textAlign: "center", padding: 12, background: "#f5f5f3", borderRadius: 4, fontSize: 13, color: "#333", textDecoration: "none", fontWeight: 500 }}>
                      {item.label}
                      {item.href === "/mesajlar" && unreadMessages > 0 && (
                        <span style={{ position: "absolute", top: 6, right: 8, minWidth: 16, height: 16, borderRadius: 100, background: "var(--brand)", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {unreadMessages > 9 ? "9+" : unreadMessages}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} style={{ textAlign: "center", padding: 10, borderRadius: 4, fontSize: 13, color: "var(--brand)", fontWeight: 600, textDecoration: "none", border: "1px solid var(--brand-border)", background: "var(--brand-soft)" }}>
                    Admin Panel
                  </Link>
                )}
                <button type="button" onClick={() => { setMobileOpen(false); logout(); }} className="navbar-btn-outline" style={{ justifyContent: "center", width: "100%", cursor: "pointer", fontFamily: "inherit" }}>
                  Çıkış yap
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/giris" onClick={() => setMobileOpen(false)} className="navbar-btn-outline" style={{ flex: 1, justifyContent: "center" }}>Giriş yap</Link>
                  <Link href="/kayit" onClick={() => setMobileOpen(false)} className="navbar-btn-outline" style={{ flex: 1, justifyContent: "center" }}>Kayıt ol</Link>
                </div>
                <Link href={loginPath("/ilan-ver")} onClick={() => setMobileOpen(false)} className="navbar-btn-primary" style={{ justifyContent: "center" }}>+ İlan ver</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <style>{`
        .cat-hover-item:hover .cat-hover-icon { transform: scale(1.04); }
        .menu-item:hover { background: #fafaf8; }
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
