import { PlusCircle, Trash2 } from "lucide-react"; // Icônes très pratiques (à installer si tu ne l'as pas fait : npm install lucide-react)

export default function SellerManager({ sellers, onChange }) {
  
  // Ajouter un vendeur vide à la liste
  const handleAddSeller = () => {
    onChange([
      ...sellers,
      { name: "", price: 0, url: "", type: "spécialiste" }
    ]);
  };

  // Supprimer un vendeur précis
  const handleRemoveSeller = (indexToRemove) => {
    const updatedSellers = sellers.filter((_, index) => index !== indexToRemove);
    onChange(updatedSellers);
  };

  // Mettre à jour un champ spécifique (nom, prix, etc.) d'un vendeur précis
  const handleFieldChange = (index, field, value) => {
    const updatedSellers = [...sellers];
    
    // Si c'est le prix, on s'assure que c'est bien un nombre
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
          {/* Si tu n'utilises pas lucide-react, tu peux remplacer <PlusCircle /> par un simple "+" */}
          <PlusCircle size={16} /> Ajouter un vendeur
        </button>
      </div>

      {sellers.length === 0 && (
        <p className="text-sm text-gray-500 italic">Aucun vendeur ajouté pour le moment.</p>
      )}

      {/* Boucle d'affichage pour chaque vendeur */}
      {sellers.map((seller, index) => (
        <div key={index} className="grid grid-cols-12 gap-3 items-end bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          
          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom (ex: Philibert)</label>
            <input
              type="text"
              value={seller.name}
              onChange={(e) => handleFieldChange(index, "name", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500"
              required
            />
          </div>

          <div className="col-span-12 md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Prix (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={seller.price}
              onChange={(e) => handleFieldChange(index, "price", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500"
              required
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">URL de la fiche</label>
            <input
              type="url"
              value={seller.url}
              onChange={(e) => handleFieldChange(index, "url", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500"
              required
            />
          </div>

          <div className="col-span-12 md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={seller.type}
              onChange={(e) => handleFieldChange(index, "type", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500"
            >
              <option value="spécialiste">Spécialiste</option>
              <option value="marketplace">Marketplace</option>
            </select>
          </div>

          <div className="col-span-12 md:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={() => handleRemoveSeller(index)}
              className="text-red-500 hover:text-red-700 p-2"
              title="Supprimer ce vendeur"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}