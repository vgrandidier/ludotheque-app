"use client";

import { useState, useEffect } from "react";

export default function ImageGallery({ boxImage, boardImage }) {
  // 1. On prépare un tableau avec les images réellement disponibles
  const images = [];
  if (boxImage) images.push({ url: boxImage, alt: "Boîte du jeu" });
  if (boardImage) images.push({ url: boardImage, alt: "Plateau du jeu" });

  // 2. L'état : null = fermé, 0 = première image, 1 = deuxième image
  const [selectedIndex, setSelectedIndex] = useState(null);

  // 3. Bonus ergonomique : Support du clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  if (images.length === 0) return null;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* --- AFFICHAGE NORMAL (Vignettes sur la page) --- */}
      <div className="flex flex-col gap-6 mb-8">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="flex-1 cursor-zoom-in hover:opacity-90 transition-opacity relative group"
            onClick={() => setSelectedIndex(idx)}
          >
            <img 
              src={img.url} 
              alt={img.alt} 
              className="w-full h-64 object-contain bg-white rounded-lg border border-gray-200 shadow-sm p-2"
            />
            {/* Petite icône au survol pour indiquer qu'on peut cliquer */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center">
              <span className="material-icons text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-4xl">
                zoom_in
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- LA POPUP (Lightbox) --- */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm">
          
          {/* Bouton Fermer */}
          <button 
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 transition-colors z-50"
            title="Fermer (Échap)"
          >
            <span className="material-icons text-4xl">close</span>
          </button>

          {/* Bouton Précédent */}
          {images.length > 1 && (
            <button 
              onClick={handlePrev}
              className="absolute left-4 text-gray-400 hover:text-white p-2 transition-colors z-50"
              title="Précédent (Flèche gauche)"
            >
              <span className="material-icons text-6xl">chevron_left</span>
            </button>
          )}

          {/* L'image en grand */}
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img 
              src={images[selectedIndex].url} 
              alt={images[selectedIndex].alt} 
              className="max-h-[90vh] max-w-[85vw] object-contain rounded-md shadow-2xl"
            />
            <div className="absolute -bottom-8 left-0 right-0 text-center text-gray-400 text-sm">
              {images[selectedIndex].alt}
            </div>
          </div>

          {/* Bouton Suivant */}
          {images.length > 1 && (
            <button 
              onClick={handleNext}
              className="absolute right-4 text-gray-400 hover:text-white p-2 transition-colors z-50"
              title="Suivant (Flèche droite)"
            >
              <span className="material-icons text-6xl">chevron_right</span>
            </button>
          )}
          
          {/* Compteur d'images en bas */}
          {images.length > 1 && (
            <div className="absolute top-6 left-6 text-white font-medium bg-white/10 px-4 py-1.5 rounded-full text-sm tracking-widest">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}