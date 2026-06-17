import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 1. Protection des pages visuelles (Front-end)
  const isEditPage = pathname === "/edit" || pathname.endsWith("/edit");
  
  if (isEditPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 2. Protection des actions en base de données (API)
  const isApiRoute = pathname.startsWith("/api/games");
  
  if (isApiRoute && req.method !== "GET" && !isLoggedIn) {
    return NextResponse.json(
      { error: "Action non autorisée. Veuillez vous connecter." }, 
      { status: 401 }
    );
  }

  return NextResponse.next();
});

// 3. Configuration du routeur
export const config = {
  matcher: [
    "/edit",
    "/games/:path*/edit",
    "/api/games/:path*"
  ],
};