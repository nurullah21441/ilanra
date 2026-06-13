"use client";
export default function TrustBar() {
  const items = [
    { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: "Güvenli alışveriş" },
    { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, text: "Komisyonsuz satış" },
    { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>, text: "Türkiye geneli" },
    { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, text: "Ücretsiz ilan ver" },
  ];
  return (
    <div style={{ background: "#fff", borderBottom: "0.5px solid #E8E8E5", padding: "13px 1.5rem", display: "flex", justifyContent: "center", gap: "clamp(1.5rem,4vw,3rem)", flexWrap: "wrap" }}>
      {items.map(({ svg, text }) => (
        <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#444", fontWeight: 500 }}>
          {svg}{text}
        </div>
      ))}
    </div>
  );
}
