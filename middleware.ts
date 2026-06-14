import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_AUTH_PATHS = ["/giris", "/kayit", "/sifremi-unuttum"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (token) return NextResponse.next();

  const redirectTarget = `${pathname}${search}`;
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/giris";
  loginUrl.search = "";
  loginUrl.searchParams.set("redirect", redirectTarget);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/mesajlar/:path*",
    "/favoriler/:path*",
    "/profil/:path*",
    "/ilanlarim/:path*",
    "/ilan-ver/:path*",
    "/admin/:path*",
    "/ilan/:id/duzenle",
  ],
};
