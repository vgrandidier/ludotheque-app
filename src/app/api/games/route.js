import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Game from "@/models/Game";
import { auth } from "@/auth";

// ==========================================
// GET : Récupérer la liste des jeux (Public)
// ==========================================
export async function GET() {
  try {
    await connectToDatabase();
    
    // On récupère tous les jeux, triés par date d'ajout (du plus récent au plus ancien)
    // .lean() permet d'obtenir un objet JavaScript pur, plus rapide à traiter
    const games = await Game.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des jeux :", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les jeux" }, 
      { status: 500 }
    );
  }
}

// ==========================================
// POST : Ajouter un nouveau jeu (Protégé)
// ==========================================
export async function POST(request) {
  try {
    // 1. Vérification de la sécurité (Double contrôle avec le middleware)
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. Connexion à la DB et récupération des données envoyées par le front
    await connectToDatabase();
    const data = await request.json();

    // 3. Création du jeu dans MongoDB
    // (Rappel : le calcul du prix le plus bas se fera tout seul grâce à notre hook Mongoose !)
    const newGame = await Game.create(data);

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du jeu :", error);
    
    // Gestion spécifique des erreurs de validation (ex: titre manquant)
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Gestion de l'erreur si le titre existe déjà (unique: true dans Mongoose)
    if (error.code === 11000) {
      return NextResponse.json({ error: "Un jeu avec ce titre existe déjà" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erreur serveur lors de la création" }, 
      { status: 500 }
    );
  }
}