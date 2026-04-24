// config/db.js — Configuration de la connexion MongoDB
// (Déjà intégré dans server.js, ce fichier est optionnel pour séparer la logique)

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion : ${error.message}`);
    process.exit(1); // Arrête le serveur si la DB est inaccessible
  }
};

module.exports = connectDB;
