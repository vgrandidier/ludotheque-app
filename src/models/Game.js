import mongoose from 'mongoose';

// Schéma imbriqué pour la liste des vendeurs (Champ 11)
const SellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['spécialiste', 'marketplace'], 
    required: true 
  },
  isLowest: { type: Boolean, default: false } // Calculé automatiquement
});

// Schéma principal du Jeu
const GameSchema = new mongoose.Schema({
  // Note : L'Id (Champ 1) est géré automatiquement par MongoDB via le champ _id
  title: { 
    type: String, 
    required: [true, "Le titre du jeu est obligatoire"], 
    trim: true,
    unique: true 
  },
  generalPresentation: { type: String, required: true }, // Champ 3
  rulesPresentation: { type: String, required: true },   // Champ 4
  materialPresentation: { type: String, required: true },// Champ 5
  endGameConditions: { type: String, required: true },   // Champ 6
  minAge: { type: Number, required: true, min: 0 },      // Champ 7
  
  // Pour le nombre de joueurs (Champ 8), utiliser un objet min/max est plus précis
  players: {
    min: { type: Number, required: true, min: 1 },
    max: { type: Number, required: true }
  },
  
  duration: { type: Number, required: true },            // Champ 9 (en minutes)
  lowestPrice: { type: Number, default: 0 },             // Champ 10 (Calculé automatiquement)
  sellers: [SellerSchema],                               // Champ 11
  youtubeUrl: { type: String, trim: true },              // Champ 12
  boxImage: { type: String, required: true },            // Champ 13 (URL Cloudinary)
  boardImage: { type: String, required: true },          // Champ 14 (URL Cloudinary)
  mechanics: [{ type: String, trim: true }],             // Champ 15
  
  // Champ 16 : Nominations / Prix Spiel des Jahres
  spielDesJahres: {
    status: { type: String, default: 'aucun' },
    year: Number
  },
  
  // Champ 17 : Nominations / Prix As d'Or
  asDor: {
    status: { type: String, default: 'aucun' }, // 'aucun', 'recommandé', 'nominé', 'vainqueur'
    year: Number
  },
  
  // Champ 18 : Catégorisation dans la ludothèque
  label: {
    type: String,
    enum: ['Dans ma ludothèque', 'Coup de coeur', 'Wishlist'],
    required: true,
    default: 'Wishlist'
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// --- AUTOMATISATION DES PRIX (Pre-save Hook) ---
// Avant chaque sauvegarde (création ou modification), ce code s'exécute
GameSchema.pre('save', function() {
  if (this.sellers && this.sellers.length > 0) {
    
    // 1. On récupère les prix, en filtrant les prix vides ou à zéro
    const validPrices = this.sellers
      .map(s => s.price)
      .filter(p => p != null && p > 0);

    // 2. S'il y a des prix valides, on trouve le plus bas
    if (validPrices.length > 0) {
      const minPrice = Math.min(...validPrices);
      this.lowestPrice = minPrice;

      // 3. Mettre à jour le flag isLowest pour chaque vendeur
      this.sellers.forEach(seller => {
        seller.isLowest = (seller.price === minPrice);
      });
    } else {
      this.lowestPrice = 0;
    }

  } else {
    this.lowestPrice = 0;
  }
  
  // Plus de next() ici, Mongoose gère tout seul !
});

// Gestion du singleton pour Next.js (Serverless)
// Évite de redéfinir le modèle à chaque rechargement à chaud (Hot Reload) en développement
const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

export default Game;