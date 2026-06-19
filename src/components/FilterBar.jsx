"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FilterBar({ uniqueMechanics }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Récupération des filtres actuellement actifs dans l'URL
  const currentLabel = searchParams.get("label") || "";
  const currentMechanic = searchParams.get("mechanic") || "";
  const currentAward = searchParams.get("award") || "";

  // Fonction magique qui met à jour l'URL sans recharger la page
  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key); // Supprime le filtre si on choisit "Tous"
    }
    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/"); // Nettoie tous les filtres d'un coup
  };

  const hasActiveFilters = currentLabel || currentMechanic || currentAward;

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-end justify-between">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow w-full md:w-auto">
        
        {/* 1. Filtre par Label */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="material-icons text-base">bookmark</span> Statut
          </label>
          <select
            value={currentLabel}
            onChange={(e) => handleFilterChange("label", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="Dans ma ludothèque">Dans ma ludothèque</option>
            <option value="Coup de coeur">Coup de coeur</option>
            <option value="Wishlist">Wishlist</option>
          </select>
        </div>

        {/* 2. Filtre par Récompense */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="material-icons text-base">emoji_events</span> Récompenses
          </label>
          <select
            value={currentAward}
            onChange={(e) => handleFilterChange("award", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="">Toutes les jeux</option>
            <option value="anyAward">Toutes les récompenses</option>
            <option value="asDor">As d'Or (Uniquement)</option>
            <option value="spiel">Spiel des Jahres (Uniquement)</option>
          </select>
        </div>

        {/* 3. Filtre par Mécanique (Dynamique !) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="material-icons text-base">settings</span> Mécaniques
          </label>
          <select
            value={currentMechanic}
            onChange={(e) => handleFilterChange("mechanic", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="">Toutes les mécaniques</option>
            {uniqueMechanics.map((mech, index) => (
              <option key={index} value={mech}>{mech}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Bouton de réinitialisation rapide */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="text-sm font-semibold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 pb-2 whitespace-nowrap"
        >
          <span className="material-icons text-base">clear_all</span> Effacer les filtres
        </button>
      )}
    </div>
  );
}