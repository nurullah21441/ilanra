import { ReactNode } from "react";

export interface CategoryStyle {
  bg: string;
  color: string;
  gradient: string;
  icon: (size?: number) => ReactNode;
}

function svg(size: number, children: ReactNode) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** Her kategori için görsel olarak ayırt edici, konuya özel ikonlar */
export const categoryStyles: Record<string, CategoryStyle> = {
  araclar: {
    bg: "#EFF6FF",
    color: "#2563EB",
    gradient: "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M4 16l1.2-4.8A2 2 0 017.1 10h9.8a2 2 0 011.9 1.2L20 16" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="16.5" cy="17.5" r="2.5" />
        <path d="M5 16h14M8 10V7.5A1.5 1.5 0 019.5 6h5A1.5 1.5 0 0116 7.5V10" />
      </>),
  },
  emlak: {
    bg: "#F0FDF4",
    color: "#16A34A",
    gradient: "linear-gradient(145deg, #DCFCE7 0%, #F0FDF4 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M4 11.5L12 4l8 7.5" />
        <path d="M6.5 11V20h11V11" />
        <path d="M10 20v-5h4v5" />
        <path d="M9.5 14h5" />
      </>),
  },
  elektronik: {
    bg: "#F5F3FF",
    color: "#7C3AED",
    gradient: "linear-gradient(145deg, #EDE9FE 0%, #F5F3FF 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
        <path d="M9.5 5.5h5" />
      </>),
  },
  giyim: {
    bg: "#FFF1F2",
    color: "#E11D48",
    gradient: "linear-gradient(145deg, #FFE4E6 0%, #FFF1F2 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M12 3a2.2 2.2 0 012 1.1l1.5.8" />
        <path d="M8.5 4.9A2.2 2.2 0 0110.5 3" />
        <path d="M6 8l-2.5 2v10.5a1 1 0 001 1h15a1 1 0 001-1V10L18 8" />
        <path d="M9 8h6" />
      </>),
  },
  "ev-yasam": {
    bg: "#FFF7ED",
    color: "#EA580C",
    gradient: "linear-gradient(145deg, #FFEDD5 0%, #FFF7ED 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M4 18V11a2 2 0 012-2h1.5" />
        <path d="M20 18V11a2 2 0 00-2-2h-1.5" />
        <path d="M4 18h16" />
        <path d="M7 18v-4a1 1 0 011-1h8a1 1 0 011 1v4" />
        <path d="M9 14h6" />
      </>),
  },
  "oyun-hobi": {
    bg: "#F0F9FF",
    color: "#0284C7",
    gradient: "linear-gradient(145deg, #E0F2FE 0%, #F0F9FF 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <rect x="3" y="8.5" width="18" height="7" rx="3.5" />
        <path d="M8.5 12v3M7 13.5h3" />
        <circle cx="15.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
      </>),
  },
  bisiklet: {
    bg: "#F7FEE7",
    color: "#65A30D",
    gradient: "linear-gradient(145deg, #ECFCCB 0%, #F7FEE7 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <circle cx="6" cy="17" r="3.5" />
        <circle cx="18" cy="17" r="3.5" />
        <path d="M9.5 17h5M12 17V10l2.5-3.5H18" />
        <path d="M6 17l2.5-5 3.5 2" />
        <path d="M12 10l-1.5-3H7" />
      </>),
  },
  "kitap-muzik": {
    bg: "#FDF4FF",
    color: "#9333EA",
    gradient: "linear-gradient(145deg, #F3E8FF 0%, #FDF4FF 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M5 5.5A2 2 0 017 3.5h11v15H7A2 2 0 015 16.5V5.5z" />
        <path d="M8 8h6M8 11.5h4" />
        <path d="M18.5 7.5c1.2.5 2 1.5 2 2.8v7.2" />
        <path d="M20.5 10.5v3.5a2.5 2.5 0 01-1 2" />
      </>),
  },
  spor: {
    bg: "#FFFBEB",
    color: "#D97706",
    gradient: "linear-gradient(145deg, #FEF3C7 0%, #FFFBEB 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
        <path d="M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
        <path d="M7.8 3.8c2.2 1.2 3.6 3.4 3.6 5.7M16.2 3.8c-2.2 1.2-3.6 3.4-3.6 5.7" />
      </>),
  },
  "ozel-ders": {
    bg: "#EEF2FF",
    color: "#4338CA",
    gradient: "linear-gradient(145deg, #E0E7FF 0%, #EEF2FF 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M4 5.5h16v11H4z" />
        <path d="M8 9h8M8 12.5h5" />
        <path d="M12 16.5V20l-2-1 2-1 2 1-2 1z" />
      </>),
  },
  "is-ilanlari": {
    bg: "#F0F9FF",
    color: "#0369A1",
    gradient: "linear-gradient(145deg, #E0F2FE 0%, #F0F9FF 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M9 8V6.5A2.5 2.5 0 0111.5 4h1A2.5 2.5 0 0115 6.5V8" />
        <path d="M3 13h18" />
        <path d="M12 13v4" />
      </>),
  },
  "tarim-bahce": {
    bg: "#ECFDF5",
    color: "#059669",
    gradient: "linear-gradient(145deg, #D1FAE5 0%, #ECFDF5 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M12 20V10" />
        <path d="M8 20h8" />
        <path d="M9.5 10c-2.5-1-3.5-3.5-2.5-6 2 1.5 3 3.5 2.5 6z" />
        <path d="M14.5 10c2.5-1 3.5-3.5 2.5-6-2 1.5-3 3.5-2.5 6z" />
      </>),
  },
  kozmetik: {
    bg: "#FDF2F8",
    color: "#DB2777",
    gradient: "linear-gradient(145deg, #FCE7F3 0%, #FDF2F8 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <rect x="9" y="3" width="6" height="5" rx="1.5" />
        <path d="M10 8v11.5a1 1 0 001 1h2a1 1 0 001-1V8" />
        <path d="M8.5 19.5h7" />
        <path d="M12 3v2" />
      </>),
  },
  yiyecek: {
    bg: "#FFF7ED",
    color: "#C2410C",
    gradient: "linear-gradient(145deg, #FFEDD5 0%, #FFF7ED 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M12 3C8.5 3 6 5.8 6 9.5 6 13.5 12 21 12 21s6-7.5 6-11.5C18 5.8 15.5 3 12 3z" />
        <path d="M12 9.5a2 2 0 100-4 2 2 0 000 4z" />
      </>),
  },
  hizmetler: {
    bg: "#F0FDF4",
    color: "#15803D",
    gradient: "linear-gradient(145deg, #DCFCE7 0%, #F0FDF4 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </>),
  },
  nakliyat: {
    bg: "#FEF3C7",
    color: "#B45309",
    gradient: "linear-gradient(145deg, #FDE68A 0%, #FEF3C7 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M2 8h11v8H2z" />
        <path d="M13 10h3.5L20 14v4h-7V10z" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="17" cy="18" r="2.5" />
        <path d="M2 12h11M13 14h4" />
      </>),
  },
  diger: {
    bg: "#F8FAFC",
    color: "#64748B",
    gradient: "linear-gradient(145deg, #E2E8F0 0%, #F8FAFC 100%)",
    icon: (s = 22) =>
      svg(s, <>
        <path d="M12 3l8 4.5v9L12 21 4 16.5v-9L12 3z" />
        <path d="M12 12v9M12 12L4 7.5M12 12l8-4.5" />
      </>),
  },
};

const slugAliases: Record<string, string> = {
  arac: "araclar",
  araba: "araclar",
  vasita: "araclar",
  otomobil: "araclar",
  konut: "emlak",
  "ev-emlak": "emlak",
  telefon: "elektronik",
  bilgisayar: "elektronik",
  moda: "giyim",
  ev: "ev-yasam",
  yasam: "ev-yasam",
  mobilya: "ev-yasam",
  oyun: "oyun-hobi",
  hobi: "oyun-hobi",
  kitap: "kitap-muzik",
  muzik: "kitap-muzik",
  "spor-outdoor": "spor",
  outdoor: "spor",
  is: "is-ilanlari",
  "is-ilani": "is-ilanlari",
  kariyer: "is-ilanlari",
  tarim: "tarim-bahce",
  bahce: "tarim-bahce",
  guzellik: "kozmetik",
  bakim: "kozmetik",
  yemek: "yiyecek",
  gida: "yiyecek",
  servis: "hizmetler",
  tamir: "hizmetler",
  tasima: "nakliyat",
  lojistik: "nakliyat",
  kargo: "nakliyat",
  digerleri: "diger",
  other: "diger",
};

export function getCategoryStyle(slug: string, iconSize = 22): CategoryStyle & { iconNode: ReactNode } {
  const key = categoryStyles[slug] ? slug : slugAliases[slug] || "diger";
  const style = categoryStyles[key] || categoryStyles.diger;
  return { ...style, iconNode: style.icon(iconSize) };
}
