/** @format */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reviews"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Check for refresh token in cookies
  // const refreshToken = checkToken()
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // If no token and trying to access private route → redirect to login
  if (!refreshToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists and trying to access public route → redirect to home
  if (refreshToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url)); // or '/home' if that's your home page
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
