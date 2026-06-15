import connectToDatabase from "@/lib/mongodb";
import Game from "@/models/Game";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GameDetailsPage({ params }) {
  // 1. On "attend" la promesse des paramètres (Nouveauté Next.js 15)
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 2. Connexion à la base de données
  await connectToDatabase();

  // 3. Recherche du jeu spécifique dans la base
  let game;
  try {
    game = await Game.findById(id).lean();
  } catch (error) {
    // Si l'ID est mal formaté
    return notFound();
  }

  // Si le jeu n'existe pas
  if (!game) {
    return notFound();
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* Bouton retour */}
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-2 font-medium">
          ← Retour à la ludothèque
        </Link>
      </div>

      {/* En-tête du jeu */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="mb-2">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              game.label === 'Coup de coeur' ? 'bg-red-100 text-red-700' :
              game.label === 'Wishlist' ? 'bg-purple-100 text-purple-700' :
              'bg-green-100 text-green-700'
            }`}>
              {game.label}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">{game.title}</h1>
          <div className="flex gap-4 mt-4 text-gray-600 font-medium">
            <span>👥 {game.players?.min} - {game.players?.max} joueurs</span>
            <span>⏳ {game.duration} min</span>
            <span>🎂 {game.minAge}+ ans</span>
          </div>
        </div>

        {/* Prix le plus bas calculé */}
        {game.lowestPrice > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center min-w-[150px]">
            <p className="text-sm text-green-800 mb-1">Meilleur prix</p>
            <p className="text-3xl font-bold text-green-600">{game.lowestPrice} €</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne de gauche : Images et Vidéo */}
        <div className="lg:col-span-1 space-y-6">
          {game.boxImage && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">Boîte du jeu</h3>
              <img src={game.boxImage} alt="Boîte" className="w-full rounded object-contain max-h-80" />
            </div>
          )}

          {game.boardImage && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">Aperçu du plateau</h3>
              <img src={game.boardImage} alt="Plateau" className="w-full rounded object-contain max-h-80" />
            </div>
          )}

          {game.youtubeUrl && (
            <a 
              href={game.youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-red-50 text-red-600 text-center py-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors font-medium shadow-sm"
            >
              ▶️ Voir la vidéo YouTube
            </a>
          )}

          {/* Récompenses */}
          {(game.asDor?.isNominated || game.spielDesJahres?.isNominated) && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 border-b border-yellow-200 pb-2 mb-4">🏆 Récompenses</h3>
              <ul className="space-y-2 text-yellow-900 text-sm">
                {game.asDor?.isNominated && (
                  <li>✨ As d'Or {game.asDor.year && `(${game.asDor.year})`}</li>
                )}
                {game.spielDesJahres?.isNominated && (
                  <li>✨ Spiel des Jahres {game.spielDesJahres.year && `(${game.spielDesJahres.year})`}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Colonne de droite : Textes, Mécaniques et Vendeurs */}
        <div className="lg:col-span-2 space-y-8">
          
            {/* Textes descriptifs (Réorganisés) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            
            {/* 1. Règles du jeu */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Règles du jeu</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{game.rulesPresentation}</p>
            </div>
            
            {/* 2. Matériel */}
            <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Matériel</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{game.materialPresentation}</p>
            </div>

            {/* 3. Fin de partie */}
            <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Fin de partie</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{game.endGameConditions}</p>
            </div>

          </div>

          {/* Mécaniques */}
          {game.mechanics && game.mechanics.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Mécaniques de jeu</h3>
              <div className="flex flex-wrap gap-2">
                {game.mechanics.map((mech, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm border border-blue-100">
                    {mech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vendeurs */}
          {game.sellers && game.sellers.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Où l'acheter ?</h3>
              <div className="space-y-3">
                {game.sellers.map((seller, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 rounded-md border ${
                      seller.isLowest ? 'border-green-400 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{seller.name}</p>
                      {seller.isLowest && <span className="text-xs text-green-600 font-bold uppercase tracking-wider">Meilleur prix</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-gray-800">{seller.price} €</span>
                      {seller.url && (
                        <a 
                          href={seller.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium transition-colors"
                        >
                          Voir l'offre
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}