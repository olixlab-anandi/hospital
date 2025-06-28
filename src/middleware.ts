import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// cookies-next --> try R & D on this package

export function middleware(request: NextRequest) {
  console.log("in middle ware ===== ");

  const { pathname } = request.nextUrl;

  const isAuthenticated = request.cookies.get("isAuthenticated")?.value;

  const role = request.cookies.get("role")?.value;

  // If already authenticated and trying to visit /login, redirect accordingly
  if (pathname === "/login" && isAuthenticated === "true") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (role === "staff") {
      return NextResponse.redirect(new URL("/staff", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url)); // default fallback
    }
  }
  if (!isAuthenticated && isAuthenticated !== undefined) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next(); // allow request
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/login", "/staff/add-schedule"],
};
