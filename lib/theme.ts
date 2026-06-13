/** ilanra design tokens — tek kaynak */
export const theme = {
  brand: "#D92D26",
  brandDark: "#B91C1C",
  brandSoft: "#FEF2F2",
  brandMuted: "#FDF3F3",
  brandBorder: "#FECACA",
  ink: "#1A1A1A",
  inkMuted: "#6B6B6B",
  inkLight: "#999999",
  surface: "#FFFFFF",
  surfacePage: "#FAFAF8",
  surfaceDark: "#0F172A",
  border: "#E8E8E5",
  borderLight: "#F0F0EE",
  hoverNeutral: "#F5F5F3",
  error: "#DC2626",
} as const;

export type ThemeColor = keyof typeof theme;
