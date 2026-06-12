import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Veuillez définir la variable d'environnement MONGODB_URI dans le fichier .env.local"
  );
}

// On utilise une variable globale pour conserver la connexion mongoose
// entre les différents rechargements à chaud (hot reload) en mode développement.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // Si la connexion existe déjà, on la retourne directement
  if (cached.conn) {
    return cached.conn;
  }

  // Si aucune connexion n'est en cours d'initialisation, on la lance
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Connexion à MongoDB réussie !");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;