"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

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

export default function DuzenleePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "", price: "", condition: "USED",
    city: "", district: "", description: "", status: "ACTIVE",
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/giris"); return; }
    });

    fetch(`/api/listings/${id}`).then(r => r.json()).then(d => {
      if (!d.listing) { router.push("/ilanlarim"); return; }
      const l = d.listing;
      setForm({
        title: l.title || "",
        price: String(l.price || ""),
        condition: l.condition || "USED",
        city: l.city || "",
        district: l.district || "",
        description: l.description || "",
        status: l.status || "ACTIVE",
      });
      setImages(l.images?.map((img: { url: string }) => img.url) || []);
      setLoading(false);
    });
  }, [id, router]);

  async function handleUpload(files: FileList) {
    if (!files.length || images.length >= 8) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).slice(0, 8 - images.length).forEach(f => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.urls) setImages(prev => [...prev, ...data.urls]);
    setUploading(false);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Başlık zorunlu"); return; }
    if (!form.price) { setError("Fiyat zorunlu"); return; }
    if (!form.city) { setError("Şehir seçimi zorunlu"); return; }

    setSaving(true);
    setError("");

    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        price: parseFloat(form.price),
        condition: form.condition,
        city: form.city,
        district: form.district,
        description: form.description,
        status: form.status,
        images,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Bir hata oluştu");
      setSaving(false);
      return;
    }

    setSuccess("İlan başarıyla güncellendi!");
    setSaving(false);
    setTimeout(() => router.push("/ilanlarim"), 1500);
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #f0f0ee", borderTopColor: "#E63946", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.25rem 5rem" }}>

        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
          <button onClick={() => router.push("/ilanlarim")} style={{ width: 36, height: 36, borderRadius: "50%", border: "0.5px solid #E8E8E5", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>İlanı Düzenle</h1>
            <p style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>Değişiklikleri yapıp kaydet</p>
          </div>
        </div>

        {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "11px 16px", borderRadius: 10, fontSize: 13.5, marginBottom: "1rem", border: "0.5px solid #fecaca" }}>⚠️ {error}</div>}
        {success && <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "11px 16px", borderRadius: 10, fontSize: 13.5, marginBottom: "1rem", border: "0.5px solid #86efac" }}>✓ {success}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* FOTOĞRAFLAR */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2 }}>Fotoğraflar</h3>
                <p style={{ fontSize: 12.5, color: "#aaa" }}>Sürükle sırala · En fazla 8 fotoğraf</p>
              </div>
              <span style={{ fontSize: 12, color: "#E63946", fontWeight: 600 }}>{images.length}/8</span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: images.length < 8 ? 10 : 0 }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: "relative", width: 88, height: 72, borderRadius: 10, overflow: "hidden", border: i === 0 ? "2.5px solid #E63946" : "1px solid #E8E8E5", flexShrink: 0 }}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {i === 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(230,57,70,.85)", color: "#fff", fontSize: 8.5, textAlign: "center", padding: "2px 0", fontWeight: 700 }}>KAPAK</div>}
                  <button onClick={() => setImages(images.filter((_, j) => j !== i))}
                    style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,.65)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>×</button>
                </div>
              ))}
              {images.length < 8 && (
                <label style={{ width: 88, height: 72, borderRadius: 10, border: "1.5px dashed #E8E8E5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4, color: "#bbb", flexShrink: 0, transition: "all .15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E63946"; (e.currentTarget as HTMLElement).style.color = "#E63946"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E8E5"; (e.currentTarget as HTMLElement).style.color = "#bbb"; }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><line x1="9" y1="3" x2="9" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 10.5 }}>{uploading ? "⏳" : "Ekle"}</span>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleUpload(e.target.files)} />
                </label>
              )}
            </div>

            {images.length === 0 && (
              <div onClick={() => fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); e.dataTransfer.files && handleUpload(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()}
                style={{ border: "2px dashed #E8E8E5", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E63946"; (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E8E5"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#444", marginBottom: 3 }}>Fotoğraf ekle</div>
                <div style={{ fontSize: 12.5, color: "#bbb" }}>Tıkla veya sürükle bırak</div>
              </div>
            )}
          </div>

          {/* BAŞLIK */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
            <label style={{ fontSize: 15, fontWeight: 700, color: "#111", display: "block", marginBottom: 10 }}>Başlık *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="İlan başlığı..." maxLength={80}
              style={{ width: "100%", padding: "12px 14px", border: "0.5px solid #E8E8E5", borderRadius: 10, fontSize: 15, outline: "none", fontFamily: "inherit" }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#E63946"}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E8E8E5"}
            />
            <div style={{ textAlign: "right", fontSize: 11.5, color: "#bbb", marginTop: 5 }}>{form.title.length}/80</div>
          </div>

          {/* AÇIKLAMA */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
            <label style={{ fontSize: 15, fontWeight: 700, color: "#111", display: "block", marginBottom: 10 }}>Açıklama / Özellikler</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Ürün hakkında bilgi, özellikler..." rows={5}
              style={{ width: "100%", padding: "12px 14px", border: "0.5px solid #E8E8E5", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical" }}
              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "#E63946"}
              onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "#E8E8E5"}
            />
          </div>

          {/* FİYAT & DURUM */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: "1rem" }}>Fiyat & Durum</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Fiyat (₺) *</label>
                <div style={{ display: "flex", border: "0.5px solid #E8E8E5", borderRadius: 10, overflow: "hidden" }}
                  onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "#E63946"}
                  onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "#E8E8E5"}>
                  <span style={{ padding: "0 14px", fontSize: 16, fontWeight: 700, color: "#555", background: "#fafaf8", borderRight: "0.5px solid #E8E8E5", display: "flex", alignItems: "center" }}>₺</span>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0" min="0"
                    style={{ flex: 1, padding: "12px 14px", border: "none", fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Durum</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[{ v: "NEW", l: "Sıfır" }, { v: "USED", l: "2. El" }].map(({ v, l }) => (
                    <button key={v} type="button" onClick={() => setForm({ ...form, condition: v })}
                      style={{ flex: 1, padding: "11px 4px", borderRadius: 9, border: form.condition === v ? "1.5px solid #E63946" : "0.5px solid #E8E8E5", background: form.condition === v ? "#fef2f2" : "#fff", color: form.condition === v ? "#E63946" : "#555", fontSize: 13, fontWeight: form.condition === v ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* İLAN DURUMU */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: "1rem" }}>İlan Durumu</h3>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { v: "ACTIVE", l: "Yayında", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
                { v: "INACTIVE", l: "Pasif", color: "#888", bg: "#f5f5f3", border: "#E8E8E5" },
                { v: "SOLD", l: "Satıldı", color: "#2563EB", bg: "#eff6ff", border: "#93c5fd" },
              ].map(({ v, l, color, bg, border }) => (
                <button key={v} type="button" onClick={() => setForm({ ...form, status: v })}
                  style={{ flex: 1, padding: "10px 4px", borderRadius: 9, border: form.status === v ? `1.5px solid ${border}` : "0.5px solid #E8E8E5", background: form.status === v ? bg : "#fff", color: form.status === v ? color : "#555", fontSize: 13, fontWeight: form.status === v ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* KONUM */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E8E8E5", padding: "1.25rem" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: "1rem" }}>Konum</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Şehir *</label>
                <div style={{ position: "relative" }}>
                  <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                    style={{ width: "100%", padding: "11px 36px 11px 14px", border: "0.5px solid #E8E8E5", borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: "#fff", outline: "none", appearance: "none", cursor: "pointer" }}
                    onFocus={e => (e.target as HTMLSelectElement).style.borderColor = "#E63946"}
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
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>İlçe <span style={{ color: "#bbb", fontWeight: 400 }}>(opsiyonel)</span></label>
                <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}
                  placeholder="İlçe..."
                  style={{ width: "100%", padding: "11px 14px", border: "0.5px solid #E8E8E5", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#E63946"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E8E8E5"}
                />
              </div>
            </div>
          </div>

          {/* KAYDET */}
          <button onClick={handleSave} disabled={saving} style={{
            padding: "16px", background: saving ? "#ccc" : "#E63946",
            color: "#fff", border: "none", borderRadius: 14,
            fontSize: 16, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "'Bricolage Grotesque', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            {saving ? (
              <><div style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />Kaydediliyor...</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Değişiklikleri Kaydet
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
