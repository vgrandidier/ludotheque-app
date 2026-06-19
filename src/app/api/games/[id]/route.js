import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Game from "@/models/Game";

// Empêche Next.js de mettre cette route en cache de façon agressive
export const dynamic = 'force-dynamic'; 

// ==========================================
// GET : Récupérer UN jeu spécifique par son ID
// ==========================================
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 1. On peuple le jeu de base (C'est ICI que l'ID se transforme en objet complet)
    const game = await Game.findById(id).populate('baseGame').lean();

    if (!game) {
      return NextResponse.json({ message: "Jeu non trouvé" }, { status: 404 });
    }

    // 2. Recherche inverse : On cherche les extensions liées
    const extensions = await Game.find({ baseGame: id })
                                 .select('title boxImage isExtension')
                                 .lean();

    game.extensions = extensions;

    return NextResponse.json(game, { status: 200 });
    
  } catch (error) {
    console.error("Erreur GET jeu :", error);
    return NextResponse.json({ error: "Impossible de récupérer les informations" }, { status: 500 });
  }
}

// ==========================================
// PUT : Modifier un jeu
// ==========================================
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const data = await request.json();

    const updatedGame = await Game.findByIdAndUpdate(id, data, { new: true });
    
    return NextResponse.json(updatedGame, { status: 200 });
  } catch (error) {
    console.error("Erreur PUT jeu :", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// ==========================================
// DELETE : Supprimer un jeu
// ==========================================
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await Game.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Jeu supprimé" }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE jeu :", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}