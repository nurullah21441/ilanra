"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useRouter, usePathname } from "next/navigation";
import { getCategoryStyle } from "@/lib/categoryStyles";

interface User { id: string; name: string; email: string; role: string; }
interface Category { id: string; name: string; icon: string; slug: string; }
interface SearchResult {
  id: string; title: string; price: number; city: string;
  images: { url: string }[]; category: { name: string; slug: string };
}

const searchHints = ["iPhone 15", "Kiralık daire", "Clio", "PlayStation 5", "MacBook"];

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
  const menuRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

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

  return (
    <>
      <nav style={{
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)",
        borderBottom: "0.5px solid #E8E8E5", position: "sticky", top: 0, zIndex: 100,
        boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.07)" : "none", transition: "box-shadow .25s",
      }}>
        <div className="nav-inner nav-inner-mobile" style={{ maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem", height: 68, display: "flex", alignItems: "center", gap: 14 }}>

          {/* LOGO */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center" }}>
            <Logo height={34} />
          </Link>

          {/* KATEGORİLER DROPDOWN */}
          <div ref={catRef} style={{ position: "relative", flexShrink: 0 }} className="d-only">
            <button
              onMouseEnter={() => setCatOpen(true)}
              onClick={() => setCatOpen(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 14px", borderRadius: 10, border: catOpen ? "0.5px solid #E63946" : "0.5px solid #E8E8E5", background: catOpen ? "#fef2f2" : "#fff", cursor: "pointer", fontSize: 13.5, color: catOpen ? "#E63946" : "#333", fontFamily: "inherit", fontWeight: 500, transition: "all .15s" }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x=".5" y=".5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <rect x="7.5" y=".5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <rect x=".5" y="7.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <rect x="7.5" y="7.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              Kategoriler
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: "transform .2s", transform: catOpen ? "rotate(180deg)" : "none", color: "#aaa" }}>
                <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {catOpen && (
              <div onMouseLeave={() => setCatOpen(false)} style={{
                position: "absolute", top: "calc(100% + 10px)", left: 0,
                background: "#fff", border: "0.5px solid #E8E8E5",
                borderRadius: 18, width: 440, maxHeight: "min(70vh, 520px)", overflowY: "auto",
                boxShadow: "0 24px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.02)",
                padding: "18px", zIndex: 200,
                animation: "dropDown .18s cubic-bezier(.4,0,.2,1)",
              }}>
                <div style={{ fontSize: 11, color: "#bbb", fontWeight: 700, letterSpacing: .6, textTransform: "uppercase", marginBottom: 14, paddingLeft: 4 }}>Tüm Kategoriler</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {categories.map(cat => {
                    const c = getCategoryStyle(cat.slug, 20);
                    return (
                      <Link key={cat.id} href={`/ilanlar?category=${cat.slug}`} onClick={() => setCatOpen(false)} style={{ textDecoration: "none" }}>
                        <div className="cat-hover-item" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 13, border: "0.5px solid transparent", transition: "all .18s ease", cursor: "pointer" }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = c.bg;
                            el.style.borderColor = `${c.color}22`;
                            el.style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = "transparent";
                            el.style.borderColor = "transparent";
                            el.style.transform = "none";
                          }}
                        >
                          <div className="cat-hover-icon" style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: c.gradient, color: c.color,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            boxShadow: `inset 0 0 0 1px ${c.color}18`,
                            transition: "transform .18s ease, box-shadow .18s ease",
                          }}>
                            {c.iconNode}
                          </div>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#222", lineHeight: 1.25 }}>{cat.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div style={{ borderTop: "0.5px solid #f0f0ee", marginTop: 10, paddingTop: 10 }}>
                  <Link href="/ilanlar" onClick={() => setCatOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, fontSize: 13.5, color: "#E63946", textDecoration: "none", fontWeight: 600, transition: "background .12s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#fef2f2"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}
                  >Tüm ilanları gör →</Link>
                </div>
              </div>
            )}
          </div>

          {/* AKILLI ARAMA */}
          <div className="nav-search-wrap d-only">
            <div ref={searchRef} style={{ width: "100%", position: "relative" }}>
            <form onSubmit={handleSearchSubmit}>
              <div style={{
                display: "flex", alignItems: "center", height: 48,
                background: searchOpen ? "#fff" : "#F7F7F5",
                border: searchOpen ? "1.5px solid #E63946" : "1.5px solid #E8E8E5",
                borderRadius: searchOpen ? "14px 14px 0 0" : 14,
                transition: "all .22s ease", overflow: "hidden", width: "100%",
                boxShadow: searchOpen
                  ? "0 0 0 4px rgba(230,57,70,.08), 0 8px 24px rgba(0,0,0,0.06)"
                  : "0 2px 10px rgba(0,0,0,0.04)",
              }}>
                <svg width="17" height="17" viewBox="0 0 15 15" fill="none"
                  style={{ marginLeft: 16, color: searchOpen ? "#E63946" : "#999", flexShrink: 0, transition: "color .2s" }}>
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  value={searchVal}
                  onChange={e => handleSearchChange(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Ne arıyorsun? Araç, daire, telefon, bisiklet..."
                  style={{ flex: 1, padding: "0 12px", height: "100%", border: "none", background: "transparent", fontSize: 14.5, outline: "none", fontFamily: "inherit", color: "#111", minWidth: 0 }}
                />
                {searchVal && (
                  <button type="button" onClick={() => { setSearchVal(""); setSearchResults([]); setSearchOpen(false); }}
                    style={{ background: "#eee", border: "none", cursor: "pointer", width: 24, height: 24, borderRadius: "50%", color: "#888", fontSize: 16, lineHeight: 1, flexShrink: 0, marginRight: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                )}
                <button type="submit" style={{
                  height: 36, marginRight: 6, padding: "0 22px", border: "none", borderRadius: 10,
                  background: searchVal.trim() || searchOpen ? "linear-gradient(135deg, #E63946, #c1121f)" : "#E4E4E1",
                  color: searchVal.trim() || searchOpen ? "#fff" : "#888",
                  fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                  transition: "all .2s ease", flexShrink: 0,
                  boxShadow: searchVal.trim() || searchOpen ? "0 4px 12px rgba(230,57,70,.25)" : "none",
                }}>Ara</button>
              </div>
            </form>

            {searchOpen && !searchVal.trim() && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: "#fff", border: "1.5px solid #E63946", borderTop: "none",
                borderRadius: "0 0 14px 14px", padding: "12px 14px 14px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.1)", zIndex: 300,
              }}>
                <div style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 10 }}>Popüler aramalar</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {searchHints.map(term => (
                    <button key={term} type="button" onClick={() => { setSearchVal(term); handleSearchChange(term); }}
                      style={{ padding: "7px 12px", borderRadius: 999, border: "0.5px solid #E8E8E5", background: "#FAFAF8", color: "#555", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E63946"; (e.currentTarget as HTMLButtonElement).style.color = "#E63946"; (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8E8E5"; (e.currentTarget as HTMLButtonElement).style.color = "#555"; (e.currentTarget as HTMLButtonElement).style.background = "#FAFAF8"; }}
                    >{term}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ARAMA SONUÇLARI */}
            {searchOpen && searchVal.trim() && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: "#fff",
                border: "1.5px solid #E63946", borderTop: "none",
                borderRadius: "0 0 12px 12px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                zIndex: 300, overflow: "hidden",
              }}>
                {searching ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "#aaa", fontSize: 13.5 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #f0f0ee", borderTopColor: "#E63946", animation: "spin .7s linear infinite", margin: "0 auto 8px" }} />
                    Aranıyor...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div style={{ padding: "8px 12px 4px", fontSize: 11, color: "#bbb", fontWeight: 600, letterSpacing: .4, textTransform: "uppercase" }}>
                      Sonuçlar
                    </div>
                    {searchResults.map(r => (
                      <Link key={r.id} href={`/ilan/${r.id}`} onClick={() => { setSearchOpen(false); setSearchVal(""); }} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", transition: "background .12s", cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafaf8"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          {/* Thumbnail */}
                          <div style={{ width: 44, height: 36, borderRadius: 8, overflow: "hidden", background: "#f5f5f3", flexShrink: 0 }}>
                            {r.images[0] ? (
                              <img src={r.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                            )}
                          </div>
                          {/* Bilgi */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                            <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{r.category.name} · {r.city}</div>
                          </div>
                          {/* Fiyat */}
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#E63946", flexShrink: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            ₺{r.price.toLocaleString("tr-TR")}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link href={`/ilanlar?q=${encodeURIComponent(searchVal)}`} onClick={() => setSearchOpen(false)} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "12px 14px", borderTop: "0.5px solid #f0f0ee", fontSize: 13, color: "#E63946", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "background .12s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fef2f2"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        &quot;{searchVal}&quot; için tüm sonuçları gör →
                      </div>
                    </Link>
                  </>
                ) : searchVal && !searching ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#aaa" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#444", marginBottom: 4 }}>Sonuç bulunamadı</div>
                    <div style={{ fontSize: 12.5 }}>&quot;{searchVal}&quot; için ilan yok</div>
                  </div>
                ) : null}
              </div>
            )}
            </div>
          </div>

          {/* SAĞ */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {user ? (
              <>
                <Link href="/ilan-ver" className="d-only" style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 38, padding: "0 16px", borderRadius: 9, background: "#E63946", color: "#fff", fontSize: 13.5, fontWeight: 600, textDecoration: "none", transition: "background .15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#c1121f"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#E63946"}
                >
                  <span style={{ fontSize: 16 }}>+</span> İlan ver
                </Link>

                <div ref={menuRef} style={{ position: "relative" }}>
                  <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 10px 0 6px", borderRadius: 100, border: "0.5px solid #E8E8E5", background: "#fff", cursor: "pointer" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#E63946,#c1121f)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="d-only" style={{ fontSize: 13.5, color: "#222", fontWeight: 500, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name.split(" ")[0]}
                    </span>
                    <svg className="d-only" width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: "transform .2s", transform: menuOpen ? "rotate(180deg)" : "none", color: "#aaa" }}>
                      <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {menuOpen && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", border: "0.5px solid #E8E8E5", borderRadius: 14, minWidth: 200, boxShadow: "0 16px 48px rgba(0,0,0,.12)", overflow: "hidden", animation: "dropDown .15s ease" }}>
                      <div style={{ padding: "12px 16px 10px", borderBottom: "0.5px solid #f0f0ee" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{user.email}</div>
                      </div>
                      {[
                        { href: "/profil", label: "Profilim", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                        { href: "/ilanlarim", label: "İlanlarım", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
                        { href: "/mesajlar", label: "Mesajlar", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
                        { href: "/favoriler", label: "Favoriler", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
                      ].map(item => (
                        <Link key={item.href} href={item.href} className="menu-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", fontSize: 13.5, color: "#444", textDecoration: "none" }}>
                          <span style={{ color: "#888" }}>{item.svg}</span>{item.label}
                        </Link>
                      ))}
                      {user.role === "ADMIN" && (
                        <Link href="/admin" className="menu-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", fontSize: 13.5, color: "#E63946", fontWeight: 600, textDecoration: "none", borderTop: "0.5px solid #f0f0ee" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={logout} className="menu-item" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 16px", fontSize: 13.5, color: "#999", border: "none", background: "transparent", cursor: "pointer", borderTop: "0.5px solid #f0f0ee", fontFamily: "inherit" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Çıkış yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/giris" className="d-only" style={{ height: 38, padding: "0 14px", display: "inline-flex", alignItems: "center", borderRadius: 9, border: "0.5px solid #E8E8E5", background: "transparent", fontSize: 13.5, color: "#333", textDecoration: "none", fontWeight: 500 }}>
                  Giriş yap
                </Link>
                <Link href="/ilan-ver" style={{ height: 38, padding: "0 16px", display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9, background: "#E63946", color: "#fff", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
                  <span style={{ fontSize: 16 }}>+</span> İlan ver
                </Link>
              </>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="m-only tap-btn" aria-label="Menü" style={{ background: "none", border: "none", cursor: "pointer", padding: 10, flexDirection: "column", gap: 5, display: "none", minWidth: 44, minHeight: 44 }}>
              <span style={{ display: "block", width: 22, height: 1.5, background: "#333", borderRadius: 2, transition: "transform .2s", transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 1.5, background: "#333", borderRadius: 2, transition: "opacity .2s", opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 22, height: 1.5, background: "#333", borderRadius: 2, transition: "transform .2s", transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* MOBİL MENÜ */}
        {mobileOpen && (
          <div style={{ borderTop: "0.5px solid #E8E8E5", background: "#fff", padding: "1rem 1.25rem 1.25rem" }}>
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", border: "1px solid #E8E8E5", borderRadius: 14, overflow: "hidden", background: "#F7F7F5", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <input value={searchVal} onChange={e => handleSearchChange(e.target.value)} placeholder="Ne arıyorsun? Araç, daire, telefon..."
                  style={{ flex: 1, padding: "13px 14px", border: "none", background: "transparent", fontSize: 14.5, outline: "none", fontFamily: "inherit" }} />
                <button type="submit" style={{ padding: "0 20px", border: "none", background: "linear-gradient(135deg, #E63946, #c1121f)", color: "#fff", fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Ara</button>
              </div>
            </form>
            <div className="mobile-cat-grid" style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "0.5px solid #f0f0ee" }}>
              {categories.slice(0, 12).map(cat => {
                const c = getCategoryStyle(cat.slug, 18);
                return (
                  <Link key={cat.id} href={`/ilanlar?category=${cat.slug}`} onClick={() => setMobileOpen(false)} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 4px", borderRadius: 12, background: c.gradient, boxShadow: `inset 0 0 0 1px ${c.color}14` }}>
                      <span style={{ color: c.color }}>{c.iconNode}</span>
                      <span style={{ fontSize: 10, color: "#555", textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>{cat.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link href="/ilanlar" onClick={() => setMobileOpen(false)} style={{ display: "block", textAlign: "center", padding: "10px", marginBottom: "1rem", borderRadius: 10, fontSize: 13.5, color: "#E63946", fontWeight: 600, textDecoration: "none", background: "#fef2f2" }}>
              Tüm ilanları gör →
            </Link>
            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/ilan-ver" onClick={() => setMobileOpen(false)} style={{ textAlign: "center", padding: "13px", background: "#E63946", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  + İlan ver
                </Link>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {mobileNavLinks.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{ textAlign: "center", padding: "12px 8px", background: "#f5f5f3", borderRadius: 10, fontSize: 13.5, color: "#333", textDecoration: "none", fontWeight: 500 }}>
                      {item.label}
                    </Link>
                  ))}
                </div>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} style={{ textAlign: "center", padding: "11px", borderRadius: 10, fontSize: 13.5, color: "#E63946", fontWeight: 600, textDecoration: "none", border: "0.5px solid #fca5a5", background: "#fef2f2" }}>
                    Admin Panel
                  </Link>
                )}
                <button onClick={() => { setMobileOpen(false); logout(); }} style={{ padding: "12px", borderRadius: 10, border: "0.5px solid #E8E8E5", background: "#fff", fontSize: 13.5, color: "#888", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                  Çıkış yap
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/giris" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: "center", padding: "12px", border: "0.5px solid #E8E8E5", borderRadius: 10, fontSize: 14, color: "#333", textDecoration: "none", fontWeight: 500 }}>Giriş yap</Link>
                  <Link href="/kayit" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: "center", padding: "12px", border: "0.5px solid #E8E8E5", borderRadius: 10, fontSize: 14, color: "#333", textDecoration: "none", fontWeight: 500 }}>Kayıt ol</Link>
                </div>
                <Link href="/ilan-ver" onClick={() => setMobileOpen(false)} style={{ textAlign: "center", padding: "13px", background: "#E63946", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  + İlan ver
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <style>{`
        .nav-search-wrap {
          flex: 1 1 420px;
          min-width: 280px;
          max-width: 640px;
          display: flex;
          justify-content: center;
          padding: 0 4px;
        }
        .nav-inner > .d-only:first-of-type { flex-shrink: 0; }
        @media (min-width: 1100px) {
          .nav-search-wrap { flex: 1 1 520px; max-width: 720px; }
        }
        .d-only { display: flex !important; }
        .m-only  { display: none !important; }
        @media (max-width: 768px) {
          .d-only { display: none !important; }
          .m-only  { display: flex !important; }
        }
        .cat-hover-item:hover .cat-hover-icon {
          transform: scale(1.06);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }
        .menu-item:hover { background: #fafaf8; }
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
