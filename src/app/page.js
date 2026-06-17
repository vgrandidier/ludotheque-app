import connectToDatabase from "@/lib/mongodb";
import Game from "@/models/Game";
import Link from "next/link";
import FilterBar from "@/components/FilterBar";

// 1. On importe la police depuis le module optimisé de Next.js
import { Bebas_Neue } from "next/font/google";

// 2. On configure la police (Bebas Neue n'existe qu'en épaisseur 400)
const bebasNeue = Bebas_Neue({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default async function HomePage({ searchParams }) {
  await connectToDatabase();
  
  // Nouveauté Next.js 15 : searchParams est une Promise, on l'attend !
  const resolvedSearchParams = await searchParams;
  const labelFilter = resolvedSearchParams?.label || "";
  const awardFilter = resolvedSearchParams?.award || "";
  const mechanicFilter = resolvedSearchParams?.mechanic || "";

 // 1. Récupération de tous les jeux triés par ordre alphabétique
  const allGames = await Game.find()
    .collation({ locale: 'fr', strength: 2 }) // Ignore la casse (majuscules/minuscules) et les accents pour le tri
    .sort({ title: 1 }) // 1 pour ordre croissant (A-Z), -1 pour décroissant (Z-A)
    .lean();

  // 2. Extraction automatique de toutes les mécaniques uniques existantes en base
  const uniqueMechanics = [
    ...new Set(allGames.flatMap((game) => game.mechanics || []))
  ].sort();

  // 3. Application des filtres choisis par l'utilisateur
  let filteredGames = allGames;

  if (labelFilter) {
    filteredGames = filteredGames.filter(game => game.label === labelFilter);
  }

  if (mechanicFilter) {
    filteredGames = filteredGames.filter(game => game.mechanics?.includes(mechanicFilter));
  }

  if (awardFilter) {
    if (awardFilter === "anyAward") {
      filteredGames = filteredGames.filter(game => 
        (game.asDor?.status && game.asDor.status !== "aucun") || 
        (game.spielDesJahres?.status && game.spielDesJahres.status !== "aucun")
      );
    } else if (awardFilter === "asDor") {
      filteredGames = filteredGames.filter(game => game.asDor?.status && game.asDor.status !== "aucun");
    } else if (awardFilter === "spiel") {
      filteredGames = filteredGames.filter(game => game.spielDesJahres?.status && game.spielDesJahres.status !== "aucun");
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      {/* En-tête principal */}
      <div className="flex justify-between items-center mb-8">
        {/* On applique ici la classe de la police Bebas Neue */}
        <h1 className={`text-5xl text-gray-800 flex items-center gap-3 tracking-wide ${bebasNeue.className}`}>
          <span className="material-icons text-4xl text-red-600">casino</span> Ma Ludothèque Idéale
        </h1>
        <Link 
          href="/edit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
        >
          <span className="material-icons text-sm">add</span> Ajouter un jeu
        </Link>
      </div>

      {/* Insertion de notre nouvelle barre de filtres */}
      <FilterBar uniqueMechanics={uniqueMechanics} />

      {/* Gestion de l'affichage si aucun jeu ne correspond aux filtres */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <span className="material-icons text-5xl text-gray-300 mb-2">search_off</span>
          <p className="text-gray-500 font-medium">Aucun jeu ne correspond à ces critères de recherche.</p>
        </div>
      ) : (
        /* Grille des cartes de jeux (3 colonnes larges) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGames.map((game) => (
            <div 
              key={game._id.toString()} 
              id={`game-${game._id.toString()}`} // <-- ON AJOUTE CET ID UNIQUE
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col ..."
            >
              
              {/* Image de la boîte */}
              {game.boxImage && (
                <div className="bg-white h-56 flex items-center justify-center p-4 border-b border-b-gray-100">
                  <img src={game.boxImage} alt={game.title} className="max-h-full max-w-full object-contain rounded" />
                </div>
              )}

              {/* Contenu textuel de la carte */}
              <div className="p-5 flex flex-col grow bg-gray-50">
                
                {/* Section Badges (Labels et Récompenses) */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {game.label && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-sm ${
                      game.label === 'Coup de coeur' || game.label === 'Coup de Coeur' ? 'bg-[#FB862C] text-white' :
                      game.label === 'Wishlist' || game.label === 'Whishlist' ? 'bg-[#8ECAE6] text-white' :
                      game.label === 'Dans ma ludothèque' ? 'bg-[#BE95C4] text-white' :
                      'bg-gray-400 text-white' // Couleur par défaut au cas où
                    }`}>
                      {game.label}
                    </span>
                  )}
                  {game.asDor?.status && game.asDor.status !== 'aucun' && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-sm border border-yellow-500 text-yellow-700 bg-yellow-50 flex items-center gap-0.5">
                      As d'Or
                    </span>
                  )}
                  {game.spielDesJahres?.status && game.spielDesJahres.status !== 'aucun' && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-sm border border-yellow-500 text-yellow-700 bg-yellow-50 flex items-center gap-0.5">
                      Spiel des Jahres
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold mb-4 text-gray-800 line-clamp-1">{game.title}</h2>
                
                {/* Ligne des Caractéristiques avec Material Icons */}
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100 text-center ">
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-blue-400 mb-1">face</span>
                    <span><span className="font-semibold text-blue-800">{game.minAge}</span> ans</span>
                  </div>
                  <div className="border-l border-gray-200 pl-4 flex flex-col items-center">
                    <span className="material-icons text-blue-400 mb-1">group</span>
                    <span><span className="font-semibold text-blue-800">{game.players?.min}-{game.players?.max}</span></span>
                  </div>
                  <div className="border-l border-gray-200 pl-4 flex flex-col items-center">
                    <span className="material-icons text-blue-400 mb-1">schedule</span>
                    <span><span className="font-semibold text-blue-800">{game.duration}</span> mn</span>
                  </div>
                  <div className="border-l border-gray-200 pl-4 flex flex-col items-center">
                    <span className="material-icons text-blue-400 mb-1">sell</span>
                    <span><span className="font-semibold text-blue-800">{game.lowestPrice > 0 ? game.lowestPrice : '--'}</span> €</span>
                  </div>
                </div>

                {/* Paragraphe de présentation tronqué */}
                <div className="mb-6 flex-grow">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-6">
                    <strong className="text-gray-900">{game.title}</strong> {game.generalPresentation?.replace(new RegExp(`^${game.title}\\s*(est|:\\s*)?`, 'i'), 'est ')}
                  </p>
                </div>

                {/* Pied de la carte (Mécaniques + Bouton) */}
                <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-gray-100">
                  {game.mechanics && game.mechanics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {game.mechanics.slice(0, 3).map((mech, index) => {
                        // On vérifie si la mécanique est "Enfants" (en ignorant la casse au cas où)
                        const isEnfants = mech.toLowerCase() === 'enfants';
                        
                        return (
                          <span 
                            key={index} 
                            className={`px-2.5 py-1 rounded text-xs font-medium border ${
                              isEnfants 
                                ? 'bg-[#A7C957] text-white border-[#A7C957]' 
                                : 'bg-gray-200 text-gray-700 border-gray-200'
                            }`}
                          >
                            {mech}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <Link 
                    href={`/games/${game._id.toString()}`} 
                    className="block w-full text-center bg-gray-800 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    Voir la fiche
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}