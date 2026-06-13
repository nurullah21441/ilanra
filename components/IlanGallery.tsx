"use client";
import { useState } from "react";

interface Props {
  images: string[];
  title: string;
  isFeatured: boolean;
}

export default function IlanGallery({ images, title, isFeatured }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return (
      <div style={{ height: 400, background: "#f5f5f3", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, color: "#ddd" }}>
        📦
      </div>
    );
  }

  return (
    <>
      {/* ANA RESİM */}
      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#f5f5f3", marginBottom: 10, cursor: "zoom-in" }}
        onClick={() => setLightbox(true)}>
        <img
          src={images[active]}
          alt={title}
          className="gallery-main-img"
        />
        {isFeatured && (
          <div style={{ position: "absolute", top: 12, left: 12, background: "#E63946", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 100, letterSpacing: .3 }}>
            ⭐ ÖNE ÇIKAN
          </div>
        )}
        {/* Zoom hint */}
        <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 12, padding: "5px 10px", borderRadius: 8, display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          Büyüt
        </div>
        {/* Ok tuşları */}
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + images.length) % images.length); }} className="tap-btn"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % images.length); }} className="tap-btn"
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}
        {/* Sayaç */}
        {images.length > 1 && (
          <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 12, padding: "4px 10px", borderRadius: 8 }}>
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* THUMBNAIL'LAR */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {images.map((url, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: 72, height: 56, borderRadius: 9, overflow: "hidden", padding: 0,
              border: i === active ? "2.5px solid #E63946" : "1.5px solid #E8E8E5",
              cursor: "pointer", flexShrink: 0, transition: "border-color .15s",
              background: "#f5f5f3",
            }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <button onClick={() => setLightbox(false)} style={{
            position: "absolute", top: 20, right: 20,
            width: 42, height: 42, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", fontSize: 22, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>

          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + images.length) % images.length); }}
                style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 3L5 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % images.length); }}
                style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 3l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </>
          )}

          <img
            src={images[active]} alt={title}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }}
          />

          {images.length > 1 && (
            <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i); }}
                  style={{ width: i === active ? 20 : 7, height: 7, borderRadius: 4, background: i === active ? "#E63946" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0, transition: "all .2s" }} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
