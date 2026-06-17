"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MechanicsManager from "@/components/MechanicsManager";
import SellerManager from "@/components/SellerManager";
import DeleteGameButton from "@/components/DeleteGameButton"; // <-- L'import à ajouter

export default function EditGamePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "", generalPresentation: "", rulesPresentation: "", materialPresentation: "", endGameConditions: "",
    minAge: 8, players: { min: 1, max: 4 }, duration: 30, label: "Dans ma ludothèque",
    youtubeUrl: "", boxImage: "", boardImage: "",
    mechanics: [], sellers: [],
    spielDesJahres: { isNominated: false, year: "" },
    asDor: { isNominated: false, year: "" }
  });

  // 1. Allons chercher les données actuelles du jeu au chargement
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/games/${id}`);
        if (!res.ok) throw new Error("Erreur lors de la récupération des données");
        const data = await res.json();
        
        const asDorStatus = data.asDor?.status || (data.asDor?.isNominated ? "nominé" : "aucun");
        const spielStatus = data.spielDesJahres?.status || (data.spielDesJahres?.isNominated ? "nominé" : "aucun");
        // On fusionne les données reçues avec notre format par défaut
        // (pour éviter les bugs si un vieux jeu n'a pas certains champs)
        setFormData(prev => ({
          ...prev,
          ...data,
          players: { ...prev.players, ...data.players },
          asDor: { ...prev.asDor, ...data.asDor },
          spielDesJahres: { ...prev.spielDesJahres, ...data.spielDesJahres }
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (id) fetchGame();
  }, [id]);

  // 2. Gestion des champs (identique à la création)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (e, category) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [name]: finalValue }
    }));
  };

  const handleImageUpload = async (e, imageField) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ludotheque_preset");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const uploadedImage = await res.json();
      setFormData((prev) => ({ ...prev, [imageField]: uploadedImage.secure_url }));
    } catch (err) {
      alert("Erreur lors de l'upload de l'image");
    }
  };

  // 3. Soumission : On utilise la méthode PUT (Modifier) au lieu de POST (Créer)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Retour automatique à la fiche du jeu après modification
        router.push(`/games/${id}`);
        router.refresh(); 
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Erreur serveur");
      }
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return <div className="text-center py-20 text-gray-500">Chargement de la fiche...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Modifier : {formData.title}</h1>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-md">
        
        {/* --- SECTION 1 : Informations de base --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du jeu</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select name="label" value={formData.label} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500">
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
            <input type="number" name="minAge" min="0" required value={formData.minAge} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joueurs (Min)</label>
            <input type="number" name="min" min="1" required value={formData.players.min} onChange={(e) => handleNestedChange(e, 'players')} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joueurs (Max)</label>
            <input type="number" name="max" min="1" required value={formData.players.max} onChange={(e) => handleNestedChange(e, 'players')} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
            <input type="number" name="duration" min="1" required value={formData.duration} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>

        {/* --- SECTION 3 : Textes de présentation --- */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Présentation générale</label>
            <textarea name="generalPresentation" required rows="3" value={formData.generalPresentation} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Règles du jeu</label>
            <textarea name="rulesPresentation" required rows="3" value={formData.rulesPresentation} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matériel</label>
            <textarea name="materialPresentation" required rows="2" value={formData.materialPresentation} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de fin de partie</label>
            <textarea name="endGameConditions" required rows="2" value={formData.endGameConditions} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2"></textarea>
          </div>
        </div>

        {/* --- SECTION 4 & 5 : Mécaniques et Vendeurs --- */}
        <div><MechanicsManager mechanics={formData.mechanics} onChange={(newMechanics) => setFormData((prev) => ({ ...prev, mechanics: newMechanics }))} /></div>
        <div><SellerManager sellers={formData.sellers} onChange={(newSellers) => setFormData((prev) => ({ ...prev, sellers: newSellers }))} /></div>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien YouTube</label>
              <input type="url" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image de la boîte</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "boxImage")} className="w-full text-sm text-gray-500 mb-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700" />
              {formData.boxImage && <img src={formData.boxImage} alt="Boîte" className="h-32 object-contain rounded" />}
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image du Plateau</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "boardImage")} className="w-full text-sm text-gray-500 mb-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700" />
              {formData.boardImage && <img src={formData.boardImage} alt="Plateau" className="h-32 object-contain rounded" />}
            </div>
          </div>

<div className="space-y-4 p-4 border border-gray-200 rounded-md h-min">
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
        </div>

{/* Actions de fin de formulaire */}
        <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200">
          
          {/* Bouton Annuler */}
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:underline font-medium transition-colors"
          >
            Annuler
          </button>

          {/* Bouton de suppression */}
          <DeleteGameButton id={id} title={formData.title} />

          {/* Bouton de sauvegarde */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`px-6 py-3 rounded-md text-white font-medium ${isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} transition-colors shadow-sm`}
          >
            {isSubmitting ? "Enregistrement..." : "Mettre à jour la fiche"}
          </button>
          
        </div>



      </form>
    </div>
  );
}