import { NextResponse } from "next/server";

export function middleware(request) {
  // 1. Cookie se token nikalo
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 2. Agar user login nahi hai aur room/create page par jaane ki koshish kare
  if (!token && (pathname.startsWith("/room") || pathname.startsWith("/create"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Agar user login hai aur login/signup page par jana chahe, toh use home bhej do
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Kin paths par middleware chalana hai
export const config = {
  matcher: ["/room/:path*", "/create"],
};