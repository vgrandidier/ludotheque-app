import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Terme de recherche manquant" }, { status: 400 });
    }

    // 1. On interroge BGG en se présentant poliment (User-Agent)
    const bggResponse = await fetch(`https://boardgamegeek.com/xmlapi2/search?query=${query}&type=boardgame,boardgameexpansion`, {
      headers: {
        "Accept": "text/xml",
        "Authorization": `Bearer ${process.env.BGG_API_TOKEN}`
      }
    });
    
    const xmlData = await bggResponse.text();

    // 🔴 LE MOUCHARD : On affiche la vraie réponse dans le terminal VS Code
    console.log("=== RÉPONSE BRUTE DE BGG ===");
    console.log(xmlData.substring(0, 300)); // Affiche les 300 premiers caractères
    console.log("============================");

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "_" });
    const jsonData = parser.parse(xmlData);

    if (!jsonData?.items?.item) {
      return NextResponse.json([], { status: 200 }); 
    }
    
    let items = jsonData.items.item;

    if (!Array.isArray(items)) {
      items = [items];
    }

    const results = items.map(item => {
      // 🛡️ SÉCURITÉ : BGG renvoie parfois plusieurs noms (tableau), on prend le premier
      const title = Array.isArray(item.name) ? item.name[0]?._value : item.name?._value;
      
      return {
        id: item._id,
        title: title || "Titre inconnu",
        year: item.yearpublished ? item.yearpublished._value : "N/A",
        type: item._type === "boardgameexpansion" ? "Extension" : "Jeu de base"
      };
    });

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error("Erreur de recherche BGG :", error);
    return NextResponse.json({ error: "Erreur lors de la recherche" }, { status: 500 });
  }
}