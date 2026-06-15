import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";

// Configuration de Cloudinary avec les variables d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET() {
  try {
    // 1. Sécurité : On s'assure que seul l'administrateur peut uploader des images
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. On génère un timestamp (requis par Cloudinary pour la validité de la signature)
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 3. On définit les paramètres de l'upload (par exemple, on range tout dans un dossier "ludotheque")
    const paramsToSign = {
      timestamp: timestamp,
      folder: "ludotheque",
    };

    // 4. On génère la signature cryptée
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    // 5. On renvoie le tout au frontend
    return NextResponse.json({ timestamp, signature, folder: "ludotheque" }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la génération de la signature Cloudinary :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}