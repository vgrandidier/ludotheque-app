import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Game from "@/models/Game";

// ==========================================
// GET : Récupérer la liste de TOUS les jeux
// ==========================================
export async function GET() {
  try {
    await connectToDatabase();
    const games = await Game.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error("Erreur GET jeux :", error);
    return NextResponse.json({ error: "Impossible de récupérer les jeux" }, { status: 500 });
  }
}

// ==========================================
// POST : Créer un NOUVEAU jeu
// ==========================================
export async function POST(request) {
  try {
    await connectToDatabase();
    
    // On récupère les données envoyées par ton formulaire
    const data = await request.json();

    // On demande à Mongoose de créer la nouvelle fiche dans la base
    const newGame = await Game.create(data);

    // On renvoie un statut 201 (Created) avec le jeu créé (qui contient le nouvel ID)
    return NextResponse.json(newGame, { status: 201 });
    
  } catch (error) {
    console.error("Erreur lors de la création du jeu :", error);
    return NextResponse.json(
      { error: "Impossible de créer le jeu" }, 
      { status: 500 }
    );
  }
}