import connectToDatabase from "@/lib/mongodb";
import Game from "@/models/Game";
import Link from "next/link";

// Forcer le rafraîchissement de la page à chaque visite (désactive le cache statique)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Connexion directe à MongoDB depuis le serveur
  await connectToDatabase();
  
  // 2. Récupération des jeux (triés du plus récent au plus ancien)
  // .lean() transforme le résultat Mongoose en objet JavaScript classique
  const games = await Game.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* En-tête */}
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Ma Ludothèque</h1>
          <p className="text-gray-500 mt-2">Découvrez ma collection de jeux de société</p>
        </div>
        <Link 
          href="/edit" 
          className="bg-gray-800 text-white px-5 py-2.5 rounded-md hover:bg-gray-700 transition-colors font-medium shadow-sm"
        >
          + Gérer les jeux
        </Link>
      </header>

      {/* Affichage conditionnel s'il n'y a pas encore de jeux */}
      {games.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-lg text-gray-500 mb-4">Ta ludothèque est encore vide.</p>
          <Link href="/edit" className="text-blue-600 hover:underline font-medium">
            Ajoute ton premier jeu ici !
          </Link>
        </div>
      ) : (
        /* Grille des jeux */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <div key={game._id.toString()} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              
              {/* Image de la boîte */}
              <div className="h-56 bg-gray-100 flex items-center justify-center p-4">
                {game.boxImage ? (
                  <img 
                    src={game.boxImage} 
                    alt={`Boîte de ${game.title}`} 
                    className="max-h-full max-w-full object-contain drop-shadow-md" 
                  />
                ) : (
                  <span className="text-gray-400 italic">Sans image</span>
                )}
              </div>

              {/* Informations du jeu */}
              <div className="p-5 flex flex-col flex-grow border-t border-gray-100">
                
                {/* Étiquette (Wishlist, Coup de coeur, etc.) */}
                <div className="mb-3 flex gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-sm ${
                    game.label === 'Coup de coeur' ? 'bg-orange-500 text-white' :
                    game.label === 'Wishlist' ? 'bg-purple-100 text-purple-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {game.label}
                  </span>
                  {game.asDor?.isNominated && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-sm border border-yellow-500 text-yellow-700 bg-yellow-50">
                      As d'Or
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold mb-4 text-gray-800 line-clamp-1">{game.title}</h2>
                
                {/* Ligne des statistiques (Âge, Joueurs, Durée, Prix) */}
                <div className="flex justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100 text-center">
                  <div>
                    <div className="text-lg mb-1">👦</div>
                    <span className="font-semibold text-gray-800">{game.minAge}</span> ans
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <div className="text-lg mb-1">👥</div>
                    <span className="font-semibold text-gray-800">{game.players?.min}-{game.players?.max}</span>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <div className="text-lg mb-1">⏱️</div>
                    <span className="font-semibold text-gray-800">{game.duration}</span> mn
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <div className="text-lg mb-1">🏷️</div>
                    <span className="font-semibold text-gray-800">{game.lowestPrice > 0 ? game.lowestPrice : '--'}</span> €
                  </div>
                </div>

                {/* Présentation générale (étendue à 6 lignes) */}
                <div className="mb-6 flex-grow">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-6">
                    <strong className="text-gray-900">{game.title}</strong> {game.generalPresentation?.replace(new RegExp(`^${game.title}\\s*(est|:\\s*)?`, 'i'), 'est ')}
                  </p>
                </div>

                {/* Footer de la carte : Mécaniques puis Bouton */}
                <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-gray-100">
                  
                  {/* Affichage des mécaniques (jusqu'à 3) */}
                  {game.mechanics && game.mechanics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {game.mechanics.slice(0, 3).map((mech, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs font-medium border border-gray-200">
                          {mech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bouton pleine largeur (impossible à écraser) */}
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