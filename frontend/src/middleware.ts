import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_token";
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  if (!isAdmin) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const isPublic = PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname === `${p}/`,
  );

  if (!token && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (token && pathname === "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/categories";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
