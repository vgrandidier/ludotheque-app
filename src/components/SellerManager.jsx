import { PlusCircle, Trash2 } from "lucide-react";

export default function SellerManager({ sellers, onChange }) {
  
  // 1. Calcul du meilleur prix en temps réel
  // On récupère tous les prix, on filtre ceux à 0 (vendeurs vides), et on prend le minimum
  const validPrices = sellers.map(s => Number(s.price)).filter(p => p > 0);
  const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

  // Ajouter un vendeur vide à la liste
  const handleAddSeller = () => {
    onChange([
      ...sellers,
      // Ajout d'un "id" temporaire pour aider React à suivre l'élément s'il change de place
      { id: Date.now().toString(), name: "", price: 0, url: "", type: "spécialiste" }
    ]);
  };

  // Supprimer un vendeur précis
  const handleRemoveSeller = (indexToRemove) => {
    const updatedSellers = sellers.filter((_, index) => index !== indexToRemove);
    onChange(updatedSellers);
  };

  // Mettre à jour un champ spécifique
  const handleFieldChange = (index, field, value) => {
    const updatedSellers = [...sellers];
    
    if (field === "price") {
      updatedSellers[index][field] = parseFloat(value) || 0;
    } else {
      updatedSellers[index][field] = value;
    }
    
    onChange(updatedSellers);
  };

  return (
    <div className="space-y-4 border border-gray-200 p-4 rounded-md bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Liste des Vendeurs</h3>
        <button
          type="button"
          onClick={handleAddSeller}
          className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors"
        >
          <PlusCircle size={16} /> Ajouter un vendeur
        </button>
      </div>

      {sellers.length === 0 && (
        <p className="text-sm text-gray-500 italic">Aucun vendeur ajouté pour le moment.</p>
      )}

      {/* Boucle d'affichage pour chaque vendeur */}
      {sellers.map((seller, index) => {
        // 2. On vérifie si ce vendeur précis possède actuellement le meilleur prix
        const isBestPrice = seller.price > 0 && Number(seller.price) === lowestPrice;

        return (
          <div 
            // 3. On utilise l'_id de la BDD, ou l'id temporaire, pour que React ne perde pas le focus
            key={seller._id || seller.id || index} 
            // 4. Application dynamique du fond vert si c'est le meilleur prix
            className={`grid grid-cols-12 gap-3 items-end p-3 border rounded-md shadow-sm transition-colors duration-300 ${
              isBestPrice ? "bg-green-50 border-green-400" : "bg-white border-gray-200"
            }`}
          >
            
            <div className="col-span-12 md:col-span-3">
              <label className={`block text-xs font-medium mb-1 ${isBestPrice ? "text-green-700 font-bold" : "text-gray-600"}`}>
                Nom (ex: Philibert)
              </label>
              <input
                type="text"
                value={seller.name}
                onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className={`block text-xs font-medium mb-1 flex items-center gap-1 ${isBestPrice ? "text-green-700 font-bold" : "text-gray-600"}`}>
                Prix (€) {isBestPrice && "🏆"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={seller.price}
                onChange={(e) => handleFieldChange(index, "price", e.target.value)}
                className={`w-full border rounded-md p-2 text-sm focus:ring-blue-500 ${isBestPrice ? "border-green-400 bg-white" : "border-gray-300"}`}
                required
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <label className={`block text-xs font-medium mb-1 ${isBestPrice ? "text-green-700 font-bold" : "text-gray-600"}`}>
                URL de la fiche
              </label>
              <input
                type="url"
                value={seller.url}
                onChange={(e) => handleFieldChange(index, "url", e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className={`block text-xs font-medium mb-1 ${isBestPrice ? "text-green-700 font-bold" : "text-gray-600"}`}>
                Type
              </label>
              <select
                value={seller.type}
                onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 bg-white"
              >
                <option value="spécialiste">Spécialiste</option>
                <option value="marketplace">Marketplace</option>
              </select>
            </div>

            <div className="col-span-12 md:col-span-1 flex justify-center pb-1">
              <button
                type="button"
                onClick={() => handleRemoveSeller(index)}
                className={`${isBestPrice ? "text-green-600 hover:text-green-800" : "text-red-500 hover:text-red-700"} p-2 transition-colors`}
                title="Supprimer ce vendeur"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
          </div>
        );
      })}
    </div>
  );
}