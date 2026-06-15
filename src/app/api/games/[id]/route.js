import connectToDatabase from "@/lib/mongodb";
import Game from "@/models/Game";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    // Nouveauté Next.js 15 : on attend les paramètres
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // On récupère les nouvelles données envoyées par le formulaire
    const data = await request.json();

    // On met à jour le document dans MongoDB
    const updatedGame = await Game.findByIdAndUpdate(id, data, {
      new: true, // Demande à Mongoose de nous renvoyer le jeu mis à jour (et non l'ancien)
      runValidators: true, // Force Mongoose à revérifier les règles (ex: pas de titre vide)
    });

    if (!updatedGame) {
      return NextResponse.json({ error: "Jeu introuvable" }, { status: 404 });
    }

    return NextResponse.json(updatedGame, { status: 200 });

  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    return NextResponse.json({ error: "Erreur serveur lors de la modification" }, { status: 500 });
  }
}

// Méthode pour LIRE les données d'un seul jeu (pour pré-remplir le formulaire)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const game = await Game.findById(id).lean();

    if (!game) {
      return NextResponse.json({ error: "Jeu introuvable" }, { status: 404 });
    }

    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    console.error("Erreur de récupération :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Méthode pour SUPPRIMER un jeu
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const deletedGame = await Game.findByIdAndDelete(id);

    if (!deletedGame) {
      return NextResponse.json({ error: "Jeu introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Jeu supprimé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return NextResponse.json({ error: "Erreur serveur lors de la suppression" }, { status: 500 });
  }
}