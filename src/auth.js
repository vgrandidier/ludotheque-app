import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null;

        // Comparaison directe, claire et sans faille possible
        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return { id: "admin", name: "Administrateur" };
        }

        return null; // Échec de l'authentification
      },
    }),
  ],
  pages: {
    signIn: "/login", 
  },
  session: {
    strategy: "jwt", 
  },
});