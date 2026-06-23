import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb"; // Adapte le chemin vers ton fichier de connexion si besoin
import Game from "@/models/Game";

export async function GET() {
  try {
    await connectMongo();
    
    // La fonction magique de Mongoose qui récupère toutes les valeurs uniques d'un tableau
    const uniqueMechanics = await Game.distinct("mechanics");
    
    // On renvoie la liste triée par ordre alphabétique
    return NextResponse.json(uniqueMechanics.sort(), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des mécaniques :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}