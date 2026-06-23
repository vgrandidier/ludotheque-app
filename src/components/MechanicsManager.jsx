"use client";

import { useState, useEffect, useRef } from "react";

export default function MechanicsManager({ mechanics = [], onChange }) {
  const [inputValue, setInputValue] = useState("");
  const [availableMechanics, setAvailableMechanics] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  // NOUVEAU : Récupérer toutes les mécaniques existantes au chargement
  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const res = await fetch("/api/mechanics");
        if (res.ok) {
          const data = await res.json();
          setAvailableMechanics(data);
        }
      } catch (error) {
        console.error("Erreur de chargement des mécaniques", error);
      }
    };
    fetchMechanics();
  }, []);

  // NOUVEAU : Gérer la frappe au clavier et filtrer les suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Si on a tapé au moins 3 caractères
    if (value.trim().length >= 3) {
      const filtered = availableMechanics.filter((mech) => 
        // Vérifie si la mécanique contient le texte (insensible à la casse)
        mech.toLowerCase().includes(value.toLowerCase()) && 
        // Ne propose pas une mécanique déjà sélectionnée
        !mechanics.includes(mech)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]); // On cache si moins de 3 caractères
    }
  };

  const handleAddMechanic = (e) => {
    e.preventDefault();
    addMechanic(inputValue);
  };

  // Fonction centrale pour ajouter la mécanique (depuis l'input ou les suggestions)
  const addMechanic = (mechanicName) => {
    const trimmed = mechanicName.trim();
    if (trimmed && !mechanics.includes(trimmed)) {
      onChange([...mechanics, trimmed]);
    }
    setInputValue("");
    setSuggestions([]); // On referme le menu
  };

  const handleRemoveMechanic = (mechanicToRemove) => {
    onChange(mechanics.filter((m) => m !== mechanicToRemove));
  };

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Mécaniques de jeu
      </label>
      
      {/* Zone de saisie avec le menu déroulant positionné en absolu */}
      <div className="relative flex gap-2 mb-4">
        <div className="flex-grow relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            // Permet d'ajouter avec la touche Entrée sans soumettre tout le formulaire
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addMechanic(inputValue);
              }
            }}
            placeholder="Ex: Draft, Placement d'ouvriers..."
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Menu déroulant des suggestions */}
          {suggestions.length > 0 && (
            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
              <li className="px-3 py-1 bg-gray-100 text-xs text-gray-500 font-semibold">
                Mécaniques existantes
              </li>
              {suggestions.map((sugg, index) => (
                <li
                  key={index}
                  onClick={() => addMechanic(sugg)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0"
                >
                  {sugg}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleAddMechanic}
          disabled={!inputValue.trim()}
          className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 disabled:bg-gray-300 transition-colors text-sm font-medium"
        >
          Ajouter
        </button>
      </div>

      {/* Affichage des tags sélectionnés */}
      <div className="flex flex-wrap gap-2">
        {mechanics.length === 0 ? (
          <span className="text-sm text-gray-400 italic">Aucune mécanique ajoutée</span>
        ) : (
          mechanics.map((mech, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {mech}
              <button
                type="button"
                onClick={() => handleRemoveMechanic(mech)}
                className="hover:text-red-600 focus:outline-none font-bold ml-1"
                title="Supprimer"
              >
                &times;
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}