"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // On utilise la fonction signIn de NextAuth
    const res = await signIn("credentials", {
      password,
      redirect: false, // On désactive la redirection auto pour gérer les erreurs nous-mêmes
    });

    if (res?.error) {
      setError("Mot de passe incorrect.");
      setIsLoading(false);
    } else {
      // Si c'est bon, on redirige vers le tableau de bord d'édition
// 🚀 LE REMÈDE MIRACLE : On force le navigateur à faire un vrai saut
      // Cela garantit que le nouveau cookie NextAuth est bien envoyé au serveur
      window.location.href = "/edit";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Accès Administrateur
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-md text-white font-medium ${
              isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}