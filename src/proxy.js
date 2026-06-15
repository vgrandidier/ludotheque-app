import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnEditPage = req.nextUrl.pathname.startsWith("/edit");

  // Si l'utilisateur tente d'accéder à la page d'édition sans être connecté
  if (isOnEditPage && !isLoggedIn) {
    // Redirection vers la page de login
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

// Indique à Next.js sur quelles routes le middleware doit s'exécuter
export const config = {
  matcher: ["/edit/:path*", "/api/games/:path*"],
};