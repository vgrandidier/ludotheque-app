import { PlusCircle, Trash2 } from "lucide-react";

export default function SellerManager({ sellers, onChange }) {
  
  // 1. Calcul du meilleur prix en temps réel
  const validPrices = sellers.map(s => Number(s.price)).filter(p => p > 0);
  const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

  // Ajouter un vendeur vide à la liste
  const handleAddSeller = () => {
    onChange([
      ...sellers,
      // NOUVEAU : On initialise isPromo à false par défaut
      { id: Date.now().toString(), name: "", price: 0, url: "", type: "spécialiste", isPromo: false }
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
      updatedSellers[index][field] = value; // Gère aussi bien le texte que le booléen (true/false) de la case à cocher
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
        const isBestPrice = seller.price > 0 && Number(seller.price) === lowestPrice;

        return (
          <div 
            key={seller._id || seller.id || index} 
            className={`grid grid-cols-12 gap-3 items-end p-3 border rounded-md shadow-sm transition-colors duration-300 ${
              isBestPrice ? "bg-green-50 border-green-400" : "bg-white border-gray-200"
            }`}
          >
            
            {/* Colonne NOM */}
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

{/* Colonne PRIX + PROMO */}
            <div className="col-span-12 md:col-span-2">
              {/* Flex-between permet d'avoir le label à gauche et la case à cocher à droite */}
              <div className="flex justify-between items-center mb-1">
                <label className={`block text-xs font-medium flex items-center gap-1 ${isBestPrice ? "text-green-700 font-bold" : "text-gray-600"}`}>
                  Prix (€) {isBestPrice && "🏆"}
                </label>
                
                {/* NOUVEAU : La case à cocher Promo */}
                <label className="flex items-center gap-1 cursor-pointer group" title="Marquer comme promotion">
                  <input
                    type="checkbox"
                    checked={seller.isPromo || false}
                    // e.target.checked renvoie true ou false
                    onChange={(e) => handleFieldChange(index, "isPromo", e.target.checked)}
                    className="w-3.5 h-3.5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                  />
                  {/* MODIFICATION ICI : on utilise material-symbols-outlined */}
                  <span className={`material-symbols-outlined text-[14px] transition-colors ${seller.isPromo ? "text-orange-500" : "text-gray-300 group-hover:text-orange-300"}`}>
                    percent_discount
                  </span>                
                </label>
              </div>
              
              <input
                type="number"
                step="0.01"
                min="0"
                value={seller.price}
                onChange={(e) => handleFieldChange(index, "price", e.target.value)}
                className={`w-full border rounded-md p-2 text-sm focus:ring-blue-500 ${isBestPrice ? "border-green-400 bg-white" : "border-gray-300"} ${seller.isPromo ? "text-orange-600 font-bold" : ""}`}
                required
              />
            </div>

            {/* Colonne URL */}
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

            {/* Colonne TYPE */}
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

            {/* Colonne BOUTON SUPPRIMER */}
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