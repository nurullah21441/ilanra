"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getCategoryStyle } from "@/lib/categoryStyles";

interface Category { id: string; name: string; slug: string; icon: string; }

const CATEGORY_ORDER = [
  "araclar", "emlak", "elektronik", "giyim", "ev-yasam", "oyun-hobi", "bisiklet",
  "kitap-muzik", "spor", "ozel-ders", "is-ilanlari", "tarim-bahce", "kozmetik",
  "yiyecek", "hizmetler", "nakliyat", "diger",
];

function sortCategories(cats: Category[]) {
  return [...cats].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug);
    const bi = CATEGORY_ORDER.indexOf(b.slug);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

const CITIES = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Amasya","Ankara","Antalya","Artvin",
  "Aydın","Balıkesir","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale",
  "Çankırı","Çorum","Denizli","Diyarbakır","Edirne","Elazığ","Erzincan","Erzurum",
  "Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Isparta","Mersin",
  "İstanbul","İzmir","Kars","Kastamonu","Kayseri","Kırklareli","Kırşehir","Kocaeli",
  "Konya","Kütahya","Malatya","Manisa","Kahramanmaraş","Mardin","Muğla","Muş",
  "Nevşehir","Niğde","Ordu","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas",
  "Tekirdağ","Tokat","Trabzon","Tunceli","Şanlıurfa","Uşak","Van","Yozgat","Zonguldak",
  "Aksaray","Bayburt","Karaman","Kırıkkale","Batman","Şırnak","Bartın","Ardahan",
  "Iğdır","Yalova","Karabük","Kilis","Osmaniye","Düzce"
].sort();

const CAT_FIELDS: Record<string, {
  key: string; label: string;
  type: "text" | "number" | "buttons" | "combo";
  options?: string[];
  placeholder?: string;
  suffix?: string;
}[]> = {
  araclar: [
    { key: "brand", label: "Marka", type: "combo", options: ["Alfa Romeo","Audi","BMW","Chevrolet","Citroën","Dacia","Fiat","Ford","Honda","Hyundai","Kia","Land Rover","Mazda","Mercedes-Benz","Mitsubishi","Nissan","Opel","Peugeot","Renault","Seat","Skoda","Subaru","Suzuki","Tesla","Toyota","Volkswagen","Volvo","Anadol","Diğer"] },
    { key: "model", label: "Model", type: "text", placeholder: "Corolla, 320i, Clio..." },
    { key: "year", label: "Yıl", type: "number", placeholder: "2010" },
    { key: "km", label: "Kilometre", type: "number", placeholder: "85000", suffix: "km" },
    { key: "fuel", label: "Yakıt", type: "buttons", options: ["Benzin","Dizel","LPG","Elektrik","Hibrit"] },
    { key: "gear", label: "Vites", type: "buttons", options: ["Manuel","Otomatik","Yarı Otomatik"] },
    { key: "color", label: "Renk", type: "combo", options: ["Beyaz","Siyah","Gri","Gümüş","Kırmızı","Mavi","Lacivert","Yeşil","Sarı","Turuncu","Kahverengi","Bej","Bordo"] },
  ],
  emlak: [
    { key: "listingType", label: "İlan Türü", type: "buttons", options: ["Satılık","Kiralık","Devren"] },
    { key: "propertyType", label: "Emlak Türü", type: "buttons", options: ["Daire","Müstakil Ev","Villa","Arsa","İşyeri / Ofis","Depo"] },
  ],
  emlak_daire: [
    { key: "sqm", label: "Metrekare", type: "number", placeholder: "120", suffix: "m²" },
    { key: "rooms", label: "Oda Sayısı", type: "buttons", options: ["Stüdyo","1+0","1+1","2+1","3+1","4+1","5+1","6+"] },
    { key: "buildingAge", label: "Bina Yaşı", type: "buttons", options: ["Sıfır","1-5 Yıl","6-10 Yıl","11-20 Yıl","21+ Yıl"] },
    { key: "floor", label: "Bulunduğu Kat", type: "combo", options: ["Bodrum","Zemin","1","2","3","4","5","6","7","8","9","10","11","12","15","20+"] },
    { key: "heating", label: "Isıtma", type: "buttons", options: ["Doğalgaz","Kombi","Merkezi","Klima","Soba","Yok"] },
  ],
  emlak_arsa: [
    { key: "sqm", label: "Metrekare", type: "number", placeholder: "500", suffix: "m²" },
    { key: "zoning", label: "İmar Durumu", type: "buttons", options: ["Konut İmarlı","Ticari İmarlı","Tarım","İmarsız","Diğer"] },
  ],
  emlak_isyeri: [
    { key: "sqm", label: "Metrekare", type: "number", placeholder: "80", suffix: "m²" },
    { key: "floor", label: "Bulunduğu Kat", type: "combo", options: ["Bodrum","Zemin","1","2","3","4","5","6","7","8","9","10+"] },
    { key: "heating", label: "Isıtma", type: "buttons", options: ["Doğalgaz","Kombi","Merkezi","Klima","Soba","Yok"] },
  ],
  elektronik: [
    { key: "brand", label: "Marka", type: "combo", options: ["Apple","Samsung","Huawei","Xiaomi","Sony","LG","Dell","HP","Lenovo","Asus","Acer","Microsoft","Google","OnePlus","Oppo","Realme","Diğer"] },
    { key: "model", label: "Model", type: "text", placeholder: "iPhone 15, Galaxy S24..." },
    { key: "storage", label: "Depolama", type: "buttons", options: ["32GB","64GB","128GB","256GB","512GB","1TB","2TB"] },
    { key: "color", label: "Renk", type: "text", placeholder: "Siyah, Beyaz, Mavi..." },
    { key: "warranty", label: "Garanti Durumu", type: "buttons", options: ["Garantili","Garantisiz"] },
  ],
  giyim: [
    { key: "gender", label: "Cinsiyet", type: "buttons", options: ["Kadın","Erkek","Unisex","Çocuk"] },
    { key: "brand", label: "Marka", type: "text", placeholder: "Nike, Zara, H&M, Mango..." },
    { key: "size", label: "Beden", type: "combo", options: ["XS","S","M","L","XL","XXL","3XL","34","36","38","40","42","44","46","36 (ayak)","37","38","39","40","41","42","43","44","45"] },
    { key: "color", label: "Renk", type: "text", placeholder: "Siyah, Beyaz, Lacivert..." },
  ],
  "ev-yasam": [
    { key: "itemType", label: "Ürün Tipi", type: "buttons", options: ["Koltuk & Kanepe","Yatak & Baza","Masa & Sandalye","Gardrop","Beyaz Eşya","Mutfak Eşyası","Aydınlatma","Dekorasyon","Diğer"] },
    { key: "brand", label: "Marka", type: "text", placeholder: "Opsiyonel" },
    { key: "color", label: "Renk / Malzeme", type: "text", placeholder: "Beyaz, Ahşap, Gri..." },
  ],
  "oyun-hobi": [
    { key: "platform", label: "Platform", type: "buttons", options: ["PlayStation 5","PlayStation 4","Xbox","Nintendo Switch","PC","Diğer"] },
    { key: "itemType", label: "Tür", type: "buttons", options: ["Konsol","Oyun","Aksesuar","Koleksiyon","Müzik Aleti","Diğer"] },
    { key: "brand", label: "Marka / İsim", type: "text", placeholder: "Sony, Microsoft, Oyun adı..." },
  ],
  bisiklet: [
    { key: "bikeType", label: "Bisiklet Türü", type: "buttons", options: ["Dağ","Yol","Elektrikli","Şehir","BMX","Çocuk","Diğer"] },
    { key: "brand", label: "Marka", type: "combo", options: ["Trek","Giant","Scott","Specialized","Bianchi","Canyon","Merida","Felt","GT","Diğer"] },
    { key: "wheelSize", label: "Jant Boyu", type: "buttons", options: ['16"','20"','24"','26"','27.5"','28"','29"'] },
    { key: "gears", label: "Vites", type: "buttons", options: ["Vitessiz","7","8","9","21","24","27"] },
  ],
  "kitap-muzik": [
    { key: "mediaType", label: "Tür", type: "buttons", options: ["Kitap","Dergi","Müzik CD","Vinyl","DVD","Diğer"] },
    { key: "name", label: "İsim / Başlık", type: "text", placeholder: "Kitap veya albüm adı" },
    { key: "author", label: "Yazar / Sanatçı", type: "text", placeholder: "Opsiyonel" },
  ],
  spor: [
    { key: "sport", label: "Spor Dalı", type: "buttons", options: ["Futbol","Basketbol","Tenis","Fitness","Koşu","Yüzme","Dağcılık","Bisiklet","Diğer"] },
    { key: "itemType", label: "Ürün Tipi", type: "text", placeholder: "Forma, ayakkabı, dumbbell..." },
    { key: "brand", label: "Marka", type: "text", placeholder: "Nike, Adidas, Opsiyonel..." },
    { key: "size", label: "Beden / Numara", type: "text", placeholder: "M, 42, Opsiyonel..." },
  ],
  diger: [
    { key: "itemType", label: "Ürün Türü", type: "text", placeholder: "Ne sattığını kısaca yaz" },
  ],
  "ozel-ders": [
    { key: "subject", label: "Ders Konusu", type: "buttons", options: ["Matematik","Fizik","Kimya","Biyoloji","Türkçe","İngilizce","Almanca","Fransızca","Tarih","Coğrafya","Müzik","Resim","Yazılım","Diğer"] },
    { key: "level", label: "Seviye", type: "buttons", options: ["İlkokul","Ortaokul","Lise","Üniversite","Yetişkin","Her Seviye"] },
    { key: "format", label: "Ders Şekli", type: "buttons", options: ["Yüz Yüze","Online","Her İkisi"] },
  ],
  "is-ilanlari": [
    { key: "jobType", label: "İş Türü", type: "buttons", options: ["Tam Zamanlı","Yarı Zamanlı","Freelance","Staj","Geçici"] },
    { key: "sector", label: "Sektör", type: "buttons", options: ["Teknoloji","Eğitim","Sağlık","Finans","Perakende","İnşaat","Turizm","Lojistik","Medya","Diğer"] },
    { key: "position", label: "Pozisyon", type: "text", placeholder: "Örn: Frontend Developer, Muhasebeci" },
    { key: "experience", label: "Deneyim", type: "buttons", options: ["Deneyimsiz","1-2 Yıl","3-5 Yıl","5+ Yıl","Fark Etmez"] },
  ],
  "tarim-bahce": [
    { key: "itemType", label: "Ürün Tipi", type: "buttons", options: ["Tohum & Fide","Gübre & Toprak","El Aletleri","Traktör & Ekipman","Sera Malzemesi","Sulama","Diğer"] },
  ],
  kozmetik: [
    { key: "itemType", label: "Kategori", type: "buttons", options: ["Parfüm","Makyaj","Cilt Bakım","Saç Bakım","Vücut Bakım","Erkek Bakım","Diğer"] },
    { key: "brand", label: "Marka", type: "text", placeholder: "Chanel, MAC, Loreal..." },
  ],
  yiyecek: [
    { key: "itemType", label: "Kategori", type: "buttons", options: ["Ev Yapımı","Organik","Kuruyemiş","Baharat","Reçel & Bal","İçecek","Diğer"] },
    { key: "weight", label: "Miktar / Ağırlık", type: "text", placeholder: "1 kg, 500 gr..." },
  ],
  hizmetler: [
    { key: "serviceType", label: "Hizmet Türü", type: "buttons", options: ["Tadilat","Temizlik","Elektrik","Su Tesisatı","Boyacı","Bahçe","Fotoğrafçı","Diğer"] },
    { key: "experience", label: "Deneyim", type: "buttons", options: ["1-3 Yıl","3-5 Yıl","5-10 Yıl","10+ Yıl"] },
  ],
  nakliyat: [
    { key: "vehicleType", label: "Araç Tipi", type: "buttons", options: ["Minibüs","Kamyonet","Kamyon","TIR","Motokurye","Diğer"] },
    { key: "service", label: "Hizmet", type: "buttons", options: ["Ev Taşıma","Ofis Taşıma","Parça Eşya","Şehiriçi","Şehirlerarası","Uluslararası"] },
  ],
};

function ComboInput({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Yazın veya seçin..."}
        style={{ width: "100%", padding: "10px 14px", border: "0.5px solid #E8E8E5", borderRadius: 9, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        
      />
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "0.5px solid #E8E8E5", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50,
          maxHeight: 200, overflowY: "auto",
        }}>
          {filtered.map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setQuery(opt); setOpen(false); }}
              style={{ padding: "9px 14px", fontSize: 13.5, cursor: "pointer", color: "#333", borderBottom: "0.5px solid #f5f5f3" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--hover-neutral)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >{opt}</div>
          ))}
          {query && !options.find(o => o.toLowerCase() === query.toLowerCase()) && (
            <div onClick={() => { onChange(query); setOpen(false); }}
              style={{ padding: "9px 14px", fontSize: 13.5, cursor: "pointer", color: "var(--brand)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--hover-neutral)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <span>+</span> &quot;{query}&quot; olarak ekle
            </div>
          )}
          {filtered.length === 0 && !query && (
            <div style={{ padding: "10px 14px", fontSize: 13, color: "#aaa" }}>Yazmaya başlayın...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function IlanVerPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [catValues, setCatValues] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: "", price: "", condition: "USED", city: "", district: "" });

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) router.replace("/giris?redirect=/ilan-ver");
      else setAuthChecked(true);
    });
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  }, [router]);

  const fields = (() => {
    if (!selectedCat) return [];
    if (selectedCat.slug === "emlak") {
      const baseFields = CAT_FIELDS["emlak"] || [];
      const propType = catValues["propertyType"] || "";
      if (propType === "Arsa") return [...baseFields, ...(CAT_FIELDS["emlak_arsa"] || [])];
      if (propType === "İşyeri / Ofis" || propType === "Depo") return [...baseFields, ...(CAT_FIELDS["emlak_isyeri"] || [])];
      if (propType) return [...baseFields, ...(CAT_FIELDS["emlak_daire"] || [])];
      return baseFields;
    }
    return CAT_FIELDS[selectedCat.slug] || CAT_FIELDS.diger;
  })();

  async function handleUpload(files: FileList) {
    if (!files.length || images.length >= 10) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).slice(0, 10 - images.length).forEach(f => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Fotoğraf yüklenemedi");
      setUploading(false);
      return;
    }
    if (data.urls) setImages(prev => [...prev, ...data.urls]);
    setUploading(false);
  }

  async function publish() {
    if (!form.title.trim()) { setError("Başlık zorunlu"); return; }
    if (!form.price) { setError("Fiyat zorunlu"); return; }
    if (!form.city) { setError("Şehir seçimi zorunlu"); return; }
    setLoading(true);
    setError("");

    const specLines = fields.filter(f => catValues[f.key]).map(f =>
      `${f.label}: ${catValues[f.key]}${f.suffix ? " " + f.suffix : ""}`
    );
    const attributes = Object.fromEntries(
      Object.entries(catValues).filter(([, v]) => v?.trim())
    );
    const description = specLines.join("\n") || form.title;

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description,
        price: parseFloat(form.price),
        condition: form.condition,
        categoryId: selectedCat!.id,
        city: form.city,
        district: form.district,
        images,
        attributes: Object.keys(attributes).length ? attributes : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Hata oluştu"); setLoading(false); return; }
    router.push(`/ilan/${data.listing.id}`);
  }

  if (!authChecked) return (
    <>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #f0f0ee", borderTopColor: "var(--brand)", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  /* ─── ADIM 0: KATEGORİ ─── */
  if (step === 0) return (
    <>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 820, paddingTop: "2.5rem", paddingBottom: "5rem" }}>
        <div className="promo-banner" style={{ marginBottom: "2rem", cursor: "default", pointerEvents: "none" }}>
          <div className="promo-banner-glow" />
          <div className="promo-banner-content">
            <div>
              <div className="promo-banner-eyebrow">2 dakikada yayında</div>
              <div className="promo-banner-title">Ücretsiz ilan ver, hemen satışa başla</div>
              <div className="promo-banner-sub">Komisyon yok · Fotoğraf ekle · Mesajla anlaş</div>
            </div>
          </div>
        </div>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(22px, 5vw, 26px)", fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>Ne satıyorsun?</h1>
        <p style={{ fontSize: 14, color: "#888", marginBottom: "2rem" }}>Kategori seç, sana özel form gelsin.</p>
        <div className="listing-grid ilan-ver-cat-grid" style={{ gap: 12 }}>
          {sortCategories(categories).map(cat => {
            const style = getCategoryStyle(cat.slug, 28);
            return (
            <button key={cat.id} onClick={() => { setSelectedCat(cat); setCatValues({}); setStep(1); }}
              className="ilan-ver-cat"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 11, padding: "20px 10px 16px", borderRadius: 16, border: "0.5px solid #E8E8E5", background: "#fff", cursor: "pointer", fontFamily: "inherit", transition: "all .18s ease" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 15,
                background: style.gradient, color: style.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `inset 0 0 0 1px ${style.color}18`,
              }}>
                {style.iconNode}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#222", textAlign: "center", lineHeight: 1.3 }}>{cat.name}</span>
            </button>
            );
          })}
        </div>
        <style>{`
          .ilan-ver-cat:hover {
            border-color: var(--brand) !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          }
        `}</style>
      </div>
    </>
  );

  /* ─── ADIM 1: FORM ─── */
  return (
    <>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 680, paddingTop: "2rem", paddingBottom: "5rem" }}>

        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
          <button onClick={() => setStep(0)} style={{ width: 36, height: 36, borderRadius: "50%", border: "0.5px solid #E8E8E5", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {selectedCat && (() => {
            const s = getCategoryStyle(selectedCat.slug, 22);
            return (
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: s.gradient, color: s.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `inset 0 0 0 1px ${s.color}18`,
              }}>{s.iconNode}</div>
            );
          })()}
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>{selectedCat?.name}</h1>
            <p style={{ fontSize: 13, color: "#aaa", marginTop: 3 }}>Formu doldurun, 60 saniyede ilan verin</p>
          </div>
        </div>

        {error && (
          <div style={{ background: "var(--brand-soft)", color: "#dc2626", padding: "11px 16px", borderRadius: 10, fontSize: 13.5, marginBottom: "1.25rem", border: "0.5px solid var(--brand-border)" }}>⚠️ {error}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* ── 1. FOTOĞRAFLAR ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.25rem 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2 }}>Fotoğraflar</h3>
                  <p style={{ fontSize: 12.5, color: "#aaa" }}>İlk fotoğraf kapak olur · En fazla 10</p>
                </div>
                {images.length > 0 && (
                  <span style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600 }}>{images.length}/10</span>
                )}
              </div>
            </div>

            {images.length > 0 ? (
              <div style={{ padding: "0 1.25rem 1.25rem" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {images.map((url, i) => (
                    <div key={i} style={{ position: "relative", width: 88, height: 72, borderRadius: 10, overflow: "hidden", border: i === 0 ? "2.5px solid var(--brand)" : "1px solid #E8E8E5", flexShrink: 0 }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {i === 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(230,57,70,.85)", color: "#fff", fontSize: 8.5, textAlign: "center", padding: "2px 0", fontWeight: 700, letterSpacing: .3 }}>KAPAK</div>}
                      <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="tap-btn"
                        style={{ position: "absolute", top: 2, right: 2, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,.65)", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>×</button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <label style={{ width: 88, height: 72, borderRadius: 10, border: "1.5px dashed #E8E8E5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4, color: "#bbb", flexShrink: 0, transition: "all .15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E8E5"; (e.currentTarget as HTMLElement).style.color = "#bbb"; }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><line x1="9" y1="3" x2="9" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      <span style={{ fontSize: 10.5 }}>Ekle</span>
                      <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleUpload(e.target.files)} />
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); e.dataTransfer.files && handleUpload(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()}
                style={{ margin: "0 1.25rem 1.25rem", border: "2px dashed #E8E8E5", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)"; (e.currentTarget as HTMLElement).style.background = "var(--hover-neutral)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E8E5"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{uploading ? "⏳" : "📸"}</div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "#444", marginBottom: 3 }}>{uploading ? "Yükleniyor..." : "Fotoğraf seç veya sürükle"}</div>
                <div style={{ fontSize: 12.5, color: "#bbb" }}>JPG, PNG, WEBP</div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleUpload(e.target.files)} />
          </div>

          {/* ── 2. BAŞLIK ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
            <label style={{ fontSize: 15, fontWeight: 700, color: "#111", display: "block", marginBottom: 10 }}>Başlık *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder={`${selectedCat?.name} ilanınız için kısa bir başlık...`}
              maxLength={80}
              style={{ width: "100%", padding: "12px 14px", border: "0.5px solid #E8E8E5", borderRadius: 10, fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border-color .15s" }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--brand)"}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E8E8E5"}
            />
            <div style={{ textAlign: "right", fontSize: 11.5, color: "#bbb", marginTop: 5 }}>{form.title.length}/80</div>
          </div>

          {/* ── 3. ÖZELLİKLER ── */}
          {fields.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2 }}>Özellikler</h3>
                <p style={{ fontSize: 12.5, color: "#aaa" }}>İlan detayında gösterilir — opsiyonel</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {fields.map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 8 }}>{field.label}</label>
                    {field.type === "buttons" ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {field.options?.map(opt => (
                          <button key={opt} type="button"
                            onClick={() => setCatValues(v => ({ ...v, [field.key]: v[field.key] === opt ? "" : opt }))}
                            style={{
                              padding: "8px 14px", borderRadius: 9,
                              border: catValues[field.key] === opt ? "1.5px solid var(--brand)" : "0.5px solid #E8E8E5",
                              background: catValues[field.key] === opt ? "var(--brand-soft)" : "#fff",
                              color: catValues[field.key] === opt ? "var(--brand)" : "#555",
                              fontSize: 13, fontWeight: catValues[field.key] === opt ? 700 : 400,
                              cursor: "pointer", fontFamily: "inherit", transition: "all .12s",
                            }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : field.type === "combo" ? (
                      <ComboInput
                        value={catValues[field.key] || ""}
                        onChange={v => setCatValues(prev => ({ ...prev, [field.key]: v }))}
                        options={field.options || []}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <div style={{ display: "flex", border: "0.5px solid #E8E8E5", borderRadius: 10, overflow: "hidden", transition: "border-color .15s" }}
                        onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)"}
                        onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "#E8E8E5"}>
                        <input type={field.type === "number" ? "number" : "text"}
                          value={catValues[field.key] || ""}
                          onChange={e => setCatValues(v => ({ ...v, [field.key]: e.target.value }))}
                          placeholder={field.placeholder || ""}
                          style={{ flex: 1, padding: "10px 14px", border: "none", fontSize: 14, outline: "none", fontFamily: "inherit" }}
                        />
                        {field.suffix && (
                          <span style={{ padding: "0 14px", fontSize: 13.5, color: "#aaa", background: "#fafaf8", borderLeft: "0.5px solid #E8E8E5", display: "flex", alignItems: "center", flexShrink: 0 }}>{field.suffix}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 4. ŞEHİR ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: "1rem" }}>Konum</h3>
            <div className="form-2col">
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Şehir *</label>
                <div style={{ position: "relative" }}>
                  <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                    style={{
                      width: "100%", padding: "11px 36px 11px 14px",
                      border: "0.5px solid #E8E8E5", borderRadius: 10,
                      fontSize: 14, fontFamily: "inherit", background: "#fff",
                      outline: "none", appearance: "none", cursor: "pointer",
                      color: form.city ? "#111" : "#aaa",
                      transition: "border-color .15s",
                    }}
                    onFocus={e => (e.target as HTMLSelectElement).style.borderColor = "var(--brand)"}
                    onBlur={e => (e.target as HTMLSelectElement).style.borderColor = "#E8E8E5"}
                  >
                    <option value="">Şehir seçin</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#aaa" }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>
                  İlçe <span style={{ color: "#bbb", fontWeight: 400 }}>(opsiyonel)</span>
                </label>
                <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}
                  placeholder="Kadıköy, Çankaya..."
                  style={{ width: "100%", padding: "11px 14px", border: "0.5px solid #E8E8E5", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color .15s" }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--brand)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E8E8E5"}
                />
              </div>
            </div>
          </div>

          {/* ── 5. FİYAT ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: "1rem" }}>Fiyat *</h3>
            <div className="form-2col" style={{ marginBottom: "1rem" }}>
              <div>
                <div style={{ display: "flex", border: "0.5px solid #E8E8E5", borderRadius: 10, overflow: "hidden", transition: "border-color .15s" }}
                  onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)"}
                  onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "#E8E8E5"}>
                  <span style={{ padding: "0 14px", fontSize: 16, fontWeight: 700, color: "#555", background: "#fafaf8", borderRight: "0.5px solid #E8E8E5", display: "flex", alignItems: "center", flexShrink: 0 }}>₺</span>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0" min="0"
                    style={{ flex: 1, padding: "12px 14px", border: "none", fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Durum</label>
                <div className="condition-btns">
                  {[{ v: "NEW", l: "Sıfır" }, { v: "LIKE_NEW", l: "Az Kullanıldı" }, { v: "USED", l: "2. El" }].map(({ v, l }) => (
                    <button key={v} type="button" onClick={() => setForm({ ...form, condition: v })}
                      style={{ flex: 1, padding: "11px 4px", borderRadius: 9, border: form.condition === v ? "1.5px solid var(--brand)" : "0.5px solid #E8E8E5", background: form.condition === v ? "var(--brand-soft)" : "#fff", color: form.condition === v ? "var(--brand)" : "#555", fontSize: 12, fontWeight: form.condition === v ? 700 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all .12s" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── YAYINLA ── */}
          <button onClick={publish} disabled={loading} style={{
            padding: "16px", background: loading ? "#ccc" : "var(--brand)",
            color: "#fff", border: "none", borderRadius: 14,
            fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Bricolage Grotesque', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            letterSpacing: -0.3, transition: "background .15s",
          }} className="btn-red">
            {loading ? (
              <><div style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />Yayınlanıyor...</>
            ) : "İlanı Yayınla →"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
