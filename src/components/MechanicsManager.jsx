import { useState } from "react";
import { X } from "lucide-react";

export default function MechanicsManager({ mechanics = [], onChange }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    // Si on appuie sur Entrée et que le champ n'est pas vide
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault(); // Empêche le formulaire global de se soumettre
      
      const newMechanic = inputValue.trim();
      
      // On évite les doublons
      if (!mechanics.includes(newMechanic)) {
        onChange([...mechanics, newMechanic]);
      }
      
      setInputValue(""); // On vide le champ après l'ajout
    }
  };

  const handleRemove = (mechanicToRemove) => {
    const updatedMechanics = mechanics.filter(m => m !== mechanicToRemove);
    onChange(updatedMechanics);
  };

  return (
    <div className="border border-gray-200 p-4 rounded-md bg-gray-50">
      <label className="block text-sm font-medium text-gray-800 mb-2">
        Mécaniques du jeu
      </label>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Taper une mécanique puis appuyer sur Entrée..."
        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 mb-3"
      />

      {/* Zone d'affichage des tags */}
      <div className="flex flex-wrap gap-2">
        {mechanics.length === 0 && (
          <span className="text-xs text-gray-500 italic">Aucune mécanique ajoutée.</span>
        )}
        
        {mechanics.map((mechanic, index) => (
          <span 
            key={index} 
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
          >
            {mechanic}
            <button
              type="button"
              onClick={() => handleRemove(mechanic)}
              className="text-blue-500 hover:text-blue-900 focus:outline-none"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}