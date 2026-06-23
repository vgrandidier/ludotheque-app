import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 1. On interroge l'API officielle de BGG (avec les stats)
// 1. On interroge l'API officielle de BGG avec notre Token
    const bggResponse = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`, {
      headers: {
        "Accept": "text/xml",
        "Authorization": `Bearer ${process.env.BGG_API_TOKEN}` // 🔴 LE BADGE EST ICI AUSSI
      }
    });    const xmlData = await bggResponse.text();

    // 2. On configure le traducteur XML vers JSON
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "_"
    });
    const jsonData = parser.parse(xmlData);

    // 3. On vérifie si le jeu existe
    const item = jsonData.items.item;
    if (!item) {
      return NextResponse.json({ error: "Jeu introuvable sur BGG" }, { status: 404 });
    }

    // 4. On extrait et on formate les données pour ton formData
    // BGG renvoie souvent un tableau pour le titre s'il y a des traductions, on prend le premier (le principal)
    const title = Array.isArray(item.name) ? item.name[0]._value : item.name._value;

    const gameData = {
      title: title,
      minAge: parseInt(item.minage._value),
      players: {
        min: parseInt(item.minplayers._value),
        max: parseInt(item.maxplayers._value)
      },
      duration: parseInt(item.playingtime._value),
      boxImage: item.image,
      // On décode le HTML de la description
      generalPresentation: item.description.replace(/&#10;/g, '\n'), 
      stats: {
        averageRating: parseFloat(item.statistics.ratings.average._value),
        weight: parseFloat(item.statistics.ratings.averageweight._value)
      }
    };

    return NextResponse.json(gameData, { status: 200 });

  } catch (error) {
    console.error("Erreur BGG :", error);
    return NextResponse.json({ error: "Erreur lors de la récupération BGG" }, { status: 500 });
  }
}