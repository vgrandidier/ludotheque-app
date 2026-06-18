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
      
{/* Navigation : Retour et Modification */}
      <div className="flex justify-between items-center mb-6">
        <Link 
          href={`/#game-${game._id.toString()}`} // <-- ON AJOUTE L'ANCRE ICI
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <span className="material-icons text-base">arrow_back</span> Retour à la ludothèque
        </Link>
        <Link 
            href={`/games/${game._id.toString()}/edit`} 
            className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            Modifier le jeu
          </Link>
      </div>

      {/* En-tête du jeu */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="mb-2">
            {game.label && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-sm w-max ${
              game.label === 'Coup de coeur' || game.label === 'Coup de Coeur' ? 'bg-[#FB862C] text-white' :
              game.label === 'Wishlist' || game.label === 'Whishlist' ? 'bg-[#8ECAE6] text-white' :
              game.label === 'Dans ma ludothèque' ? 'bg-[#BE95C4] text-white' :
              'bg-gray-400 text-white'
            }`}>
              {game.label}
            </span>
          )}
          </div>
          <h1 className="text-4xl font-bold text-gray-800">{game.title}</h1>
          {/* Ligne des statistiques */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mt-4 text-gray-600 font-medium">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                    <span className="material-icons text-[#679BBC] mb-1">face</span>
                    <span><span className="font-semibold text-gray-800">{game.minAge}</span>+</span>
                  </div>
                  <div className="border-l border-gray-200 pl-4 flex flex-col items-center">
                    <span className="material-icons text-[#679BBC] mb-1">group</span>
                    <span><span className="font-semibold text-gray-800">{game.players?.min === game.players?.max 
    ? `${game.players?.min}` 
    : `${game.players?.min} - ${game.players?.max}`}</span></span>
                  </div>
                  <div className="border-l border-gray-200 pl-4 flex flex-col items-center">
                    <span className="material-icons text-[#679BBC] mb-1">schedule</span>
                    <span><span className="font-semibold text-gray-800">{game.duration}</span> mn</span>
                  </div>
                </div>
          </div>

        </div>

        {/* Bloc des prix (Aligné à droite) */}
          <div className="flex flex-row flex-wrap items-center gap-3 mt-2">
            
            {/* Bloc Occasion (Ne s'affiche que si un prix min ou max est renseigné) */}
            {(game.usedPriceMin || game.usedPriceMax) && (
              <div className="bg-orange-50 px-4 py-3 rounded-lg border border-orange-200 text-center shadow-sm min-w-[120px]">
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                  <span className="material-icons text-[14px]">recycling</span> Occasion
                </p>
                <p className="text-xl font-bold text-orange-800">
                  {game.usedPriceMin ? `${game.usedPriceMin}` : '?'} - {game.usedPriceMax ? `${game.usedPriceMax} €` : '? €'}
                </p>
              </div>
            )}

            {/* Bloc Neuf (Ton bloc existant retravaillé pour s'aligner) */}
            <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-200 text-center shadow-sm min-w-[120px]">
              <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <span className="material-icons text-[14px]">storefront</span> Meilleur prix
              </p>
              <p className="text-xl font-bold text-green-800">
                {game.lowestPrice > 0 ? `${game.lowestPrice} €` : '-- €'}
              </p>
            </div>
            
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
{/* Colonne de gauche : Récompenses, Images et Vidéo */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Récompenses (Déplacé tout en haut) */}
          {((game.asDor?.status && game.asDor.status !== 'aucun') || (game.spielDesJahres?.status && game.spielDesJahres.status !== 'aucun')) && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 border-b border-yellow-200 pb-2 mb-4 flex items-center gap-2">
                <span className="material-icons">emoji_events</span> Récompenses
              </h3>
              <ul className="space-y-2 text-yellow-900 text-sm">
                {game.asDor?.status && game.asDor.status !== 'aucun' && (
                  <li className="flex items-center gap-2"><span className="material-icons text-yellow-600 text-sm">star</span> As d'Or {game.asDor.year && `(${game.asDor.year})`} : <strong className="capitalize">{game.asDor.status}</strong></li>
                )}
                {game.spielDesJahres?.status && game.spielDesJahres.status !== 'aucun' && (
                  <li className="flex items-center gap-2"><span className="material-icons text-yellow-600 text-sm">star</span> Spiel des Jahres {game.spielDesJahres.year && `(${game.spielDesJahres.year})`} : <strong className="capitalize">{game.spielDesJahres.status}</strong></li>
                )}
              </ul>
            </div>
          )}

          {/* Image de la boîte */}
          {game.boxImage && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">Boîte du jeu</h3>
              <img src={game.boxImage} alt="Boîte" className="w-full rounded object-contain max-h-80" />
            </div>
          )}

          {/* Image du plateau */}
          {game.boardImage && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">Aperçu du plateau</h3>
              <img src={game.boardImage} alt="Plateau" className="w-full rounded object-contain max-h-80" />
            </div>
          )}

          {/* Vidéo YouTube intégrée */}
          {game.youtubeUrl && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">Vidéo explicative</h3>
              <iframe
                src={
                  game.youtubeUrl.includes("embed/") ? game.youtubeUrl
                  : game.youtubeUrl.includes("youtu.be/") ? `https://www.youtube.com/embed/${game.youtubeUrl.split("youtu.be/")[1]?.split("?")[0]}`
                  : game.youtubeUrl.includes("watch?v=") ? `https://www.youtube.com/embed/${game.youtubeUrl.split("watch?v=")[1]?.split("&")[0]}`
                  : game.youtubeUrl
                }
                title={`Vidéo de ${game.title}`}
                className="w-full aspect-video rounded-md shadow-sm"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
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
            </div>
          )}

          {/* Vendeurs */}
          {game.sellers && game.sellers.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Où l'acheter ?</h3>
              {/* Liste des vendeurs (Où l'acheter ?) */}
            {/* Liste des vendeurs (Où l'acheter ?) */}
              <div className="space-y-3">
                {(() => {
                  // 1. On calcule le VRAI prix minimum
                  const validPrices = game.sellers.map(s => Number(s.price)).filter(p => p > 0);
                  const actualLowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

                  // 2. NOUVEAU : On crée une copie de la liste et on la trie du moins cher au plus cher
                  const sortedSellers = [...game.sellers].sort((a, b) => {
                    // On place les prix à 0 ou vides à la fin
                    if (!a.price) return 1;
                    if (!b.price) return -1;
                    return Number(a.price) - Number(b.price);
                  });

                  // 3. On utilise 'sortedSellers' au lieu de 'game.sellers' pour l'affichage
                  return sortedSellers.map((seller, index) => {
                    const isBestPrice = Number(seller.price) === actualLowestPrice;

                    return (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          isBestPrice ? "bg-green-50 border-green-400" : "bg-white border-gray-200"
                        }`}
                      >
                        {/* Colonne de gauche : Nom et Badge */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            
                            {/* Badge de type */}
                            {seller.type && seller.type.toLowerCase().includes('marketplace') ? (
                              <span className="text-[14px] font-bold tracking-wide bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm border border-gray-200 flex items-center gap-1 w-max">
                                <span className="material-icons text-[14px]">shopping_cart</span> <span className="font-bold text-gray-800">{seller.name}</span>
                              </span>
                            ) : seller.type ? (
                              <span className="text-[14px] font-bold tracking-wide bg-purple-50 text-purple-700 px-2 py-0.5 rounded-sm border border-purple-200 flex items-center gap-1 w-max">
                                <span className="material-icons text-[14px]">casino</span> <span className="font-bold text-purple-800">{seller.name}</span>
                              </span>
                            ) : null}
                          </div>
                          
                          {/* Mention Meilleur prix */}
                          {isBestPrice && (
                            <span className="text-xs font-bold text-green-600 uppercase tracking-wide mt-1">
                              Meilleur prix
                            </span>
                          )}
                        </div>

                        {/* Colonne de droite : Prix et Bouton */}
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-900">
                            {seller.price} €
                          </span>
                          
                          <a 
                            href={seller.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                          >
                            Voir l'offre
                          </a>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}