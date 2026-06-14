export const SITE_NAME = "ilanra";
export const SITE_DOMAIN = "ilanra.com";
export const SITE_EMAIL = "ilanrainfo@gmail.com";
export const SITE_TAGLINE = "Türkiye'nin modern ilan platformu";

export function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function absoluteUrl(path: string) {
  const base = siteUrl().replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
