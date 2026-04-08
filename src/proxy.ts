import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

/**
 * Sadece uygulama sayfaları — /api/* (NextAuth OAuth, callback) middleware'den tamamen muaf.
 * Aksi halde signIn / callback sırasında req.auth boş görünüp /login'e düşülebiliyordu.
 */
export const config = {
  matcher: ["/", "/login", "/profile", "/category/:path*"],
};
