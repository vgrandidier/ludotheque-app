"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SellerManager from "@/components/SellerManager";
import MechanicsManager from "@/components/MechanicsManager";

export default function EditGamePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

// 1. Initialisation complète de l'état
  const [formData, setFormData] = useState({
    title: "",
    generalPresentation: "",
    rulesPresentation: "",
    materialPresentation: "",
    endGameConditions: "",
    minAge: 8,
    players: { min: 1, max: 4 },
    duration: 30,
    label: "Wishlist",
    youtubeUrl: "",
    boxImage: "",
    boardImage: "",
    mechanics: [], 
    sellers: [],
    spielDesJahres: { isNominated: false, year: "" },
    asDor: { isNominated: false, year: "" }
  });

  // 2. Gestion générique classique (déjà existante)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2.bis Gestion des champs imbriqués (Joueurs, Récompenses)
  const handleNestedChange = (e, category) => {
    const { name, value, type, checked } = e.target;
    // Si c'est une case à cocher, on prend "checked", sinon "value"
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: finalValue
      }
    }));
  };

  {/* Section : Mécaniques */}
    <div className="my-6">
    <MechanicsManager 
        mechanics={formData.mechanics} 
        onChange={(newMechanics) => setFormData((prev) => ({ ...prev, mechanics: newMechanics }))} 
    />
    </div>

  {/* Section : Gestion des vendeurs */}
    <div className="my-6">
    <SellerManager 
        sellers={formData.sellers} 
        onChange={(newSellers) => setFormData((prev) => ({ ...prev, sellers: newSellers }))} 
    />
    </div>

  // 3. Logique d'upload d'image vers Cloudinary
  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // A. Demander la signature à notre backend
      const sigRes = await fetch("/api/upload/signature");
      const { signature, timestamp, folder } = await sigRes.json();

      // B. Préparer le colis pour Cloudinary
      const cloudData = new FormData();
      cloudData.append("file", file);
      cloudData.append("signature", signature);
      cloudData.append("timestamp", timestamp);
      cloudData.append("folder", folder);
      cloudData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY); 
      // Note : Il faudra ajouter NEXT_PUBLIC_CLOUDINARY_API_KEY dans ton .env.local

      // C. Envoyer directement à Cloudinary
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: cloudData }
      );
      
      const uploadData = await uploadRes.json();

      // D. Sauvegarder l'URL renvoyée dans notre formulaire
      setFormData((prev) => ({ ...prev, [fieldName]: uploadData.secure_url }));
    } catch (err) {
      console.error("Erreur d'upload :", err);
      setError("Échec de l'envoi de l'image.");
    }
  };

  // 4. Soumission finale vers notre API MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. On recalcule le meilleur prix officiel à partir des vendeurs actuels
      const validPrices = formData.sellers && formData.sellers.length > 0 
        ? formData.sellers.map(s => Number(s.price)).filter(p => p > 0) 
        : [];
      
      const calculatedLowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

      // 2. On fusionne ce nouveau prix avec le reste des données
      const dataToSend = {
        ...formData,
        lowestPrice: calculatedLowestPrice
      };

      // 3. FETCH ADAPTÉ POUR LA CRÉATION (POST et pas d'ID dans l'URL)
      const res = await fetch(`/api/games`, {
        method: "POST", // On utilise POST pour créer
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        // 4. On récupère la réponse du serveur pour connaître l'ID du jeu fraîchement créé
        const newGame = await res.json();
        
        // On redirige vers la page du nouveau jeu
        router.push(`/games/${newGame._id}`);
        router.refresh(); 
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Erreur serveur");
      }
    } catch (err) {
      // Astuce de pro : On force l'affichage de l'erreur cachée dans la console !
      console.error("Détail du plantage intercepté :", err);
      setError("Erreur réseau ou problème d'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
<div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ajouter un nouveau jeu</h1>
      </div>  
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-md">
        
        {/* --- SECTION 1 : Informations de base --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du jeu</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            >
              <option value="Wishlist">Wishlist</option>
              <option value="Dans ma ludothèque">Dans ma ludothèque</option>
              <option value="Coup de coeur">Coup de coeur</option>
            </select>
          </div>
        </div>

        {/* --- SECTION 2 : Caractéristiques techniques --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Âge minimum</label>
            <input
              type="number"
              name="minAge"
              min="0"
              required
              value={formData.minAge}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joueurs (Min)</label>
            <input
              type="number"
              name="min"
              min="1"
              required
              value={formData.players.min}
              onChange={(e) => handleNestedChange(e, 'players')}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joueurs (Max)</label>
            <input
              type="number"
              name="max"
              min="1"
              required
              value={formData.players.max}
              onChange={(e) => handleNestedChange(e, 'players')}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
            <input
              type="number"
              name="duration"
              min="1"
              required
              value={formData.duration}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* --- SECTION 3 : Textes de présentation --- */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Présentation générale</label>
            <textarea
              name="generalPresentation"
              required
              rows="3"
              value={formData.generalPresentation}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Règles du jeu</label>
            <textarea
              name="rulesPresentation"
              required
              rows="3"
              value={formData.rulesPresentation}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matériel</label>
            <textarea
              name="materialPresentation"
              required
              rows="2"
              value={formData.materialPresentation}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de fin de partie</label>
            <textarea
              name="endGameConditions"
              required
              rows="2"
              value={formData.endGameConditions}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        {/* --- SECTION 4 : Mécaniques (Sous-composant) --- */}
        <div>
          <MechanicsManager 
            mechanics={formData.mechanics} 
            onChange={(newMechanics) => setFormData((prev) => ({ ...prev, mechanics: newMechanics }))} 
          />
        </div>

        {/* --- SECTION 5 : Vendeurs (Sous-composant) --- */}
        <div>
          <SellerManager 
            sellers={formData.sellers} 
            onChange={(newSellers) => setFormData((prev) => ({ ...prev, sellers: newSellers }))} 
          />
        </div>
{/* Encadré : Marché de l'occasion */}
        <div className="mt-6 bg-orange-50 p-5 rounded-lg border border-orange-200 shadow-sm">
          <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-icons text-base">recycling</span> Marché de l'occasion (Estimation)
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-orange-900 font-medium mb-1">Prix minimum (€)</label>
              <input 
                type="number" 
                step="0.1" 
                name="usedPriceMin" 
                value={formData.usedPriceMin || ''} 
                onChange={handleChange} 
                className="w-full border border-orange-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" 
                placeholder="Ex: 15" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-orange-900 font-medium mb-1">Prix maximum (€)</label>
              <input 
                type="number" 
                step="0.1" 
                name="usedPriceMax" 
                value={formData.usedPriceMax || ''} 
                onChange={handleChange} 
                className="w-full border border-orange-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" 
                placeholder="Ex: 25" 
              />
            </div>
          </div>
        </div>
        {/* --- SECTION 6 : Médias & Récompenses --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* === COLONNE GAUCHE : Médias === */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien YouTube</label>
              <input
                type="url"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image de la boîte</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "boxImage")}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
              />
              {formData.boxImage && (
                <div className="mt-4">
                  <img src={formData.boxImage} alt="Aperçu de la boîte" className="h-32 object-contain rounded" />
                </div>
              )}
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image du Plateau</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "boardImage")}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
              />
              {formData.boardImage && (
                <div className="mt-4">
                  <img src={formData.boardImage} alt="Aperçu du plateau" className="h-32 object-contain rounded" />
                </div>
              )}
            </div>
          </div>

          {/* === COLONNE DROITE : Récompenses & Liens annexes === */}
          <div className="space-y-6">
            
            {/* Bloc Nominations & Prix */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-md h-min bg-white">
              <h3 className="font-medium text-gray-800 border-b pb-2">Nominations & Prix</h3>
              
              {/* As d'Or */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm font-medium w-32">As d'Or</span>
                <select 
                  name="status" 
                  value={formData.asDor?.status || "aucun"} 
                  onChange={(e) => handleNestedChange(e, 'asDor')} 
                  className="border rounded p-1.5 text-sm flex-grow"
                >
                  <option value="aucun">Aucun</option>
                  <option value="recommandé">Recommandé</option>
                  <option value="nominé">Nominé</option>
                  <option value="vainqueur">Vainqueur</option>
                </select>
                {formData.asDor?.status && formData.asDor.status !== "aucun" && (
                  <input type="number" name="year" placeholder="Année" value={formData.asDor?.year || ""} onChange={(e) => handleNestedChange(e, 'asDor')} className="border rounded p-1.5 text-sm w-24" />
                )}
              </div>

              {/* Spiel des Jahres */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                <span className="text-sm font-medium w-32">Spiel d. Jahres</span>
                <select 
                  name="status" 
                  value={formData.spielDesJahres?.status || "aucun"} 
                  onChange={(e) => handleNestedChange(e, 'spielDesJahres')} 
                  className="border rounded p-1.5 text-sm flex-grow"
                >
                  <option value="aucun">Aucun</option>
                  <option value="recommandé">Recommandé</option>
                  <option value="nominé">Nominé</option>
                  <option value="vainqueur">Vainqueur</option>
                </select>
                {formData.spielDesJahres?.status && formData.spielDesJahres.status !== "aucun" && (
                  <input type="number" name="year" placeholder="Année" value={formData.spielDesJahres?.year || ""} onChange={(e) => handleNestedChange(e, 'spielDesJahres')} className="border rounded p-1.5 text-sm w-24" />
                )}
              </div>
            </div>

            {/* Bloc Board Game Arena */}
            <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lien Board Game Arena (Optionnel)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Ajoute l'URL de la page du jeu sur BGA pour intégrer un bouton "Jouer en ligne".
              </p>
              <input
                type="url"
                value={formData.bgaUrl || ""}
                onChange={(e) => setFormData({ ...formData, bgaUrl: e.target.value })}
                placeholder="https://boardgamearena.com/gamepanel?game=7wonders"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

          </div>
          
        </div>

{/* Boutons de validation en bas */}
        <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            onClick={() => router.push('/')} 
            className="px-4 py-2 text-gray-600 hover:underline"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`px-6 py-3 rounded-md text-white font-medium ${isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} transition-colors`}
          >
            {isSubmitting ? "Enregistrement..." : "Sauvegarder la fiche"}
          </button>
        </div>

      </form>
    </div>
  );
}