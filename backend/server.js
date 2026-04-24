// ============================================
// server.js — Point d'entrée du backend
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Charge les variables du fichier .env

const app = express();

// ── MIDDLEWARES GLOBAUX ──────────────────────
app.use(cors({
  origin: 'http://localhost:3001', // Adresse du frontend React
  credentials: true,
}));
app.use(express.json()); // Permet de lire le JSON dans les requêtes
app.use(express.urlencoded({ extended: true }));

// Dossier pour les images uploadées (accessibles via /uploads/...)
app.use('/uploads', express.static('uploads'));

// ── CONNEXION À MONGODB ──────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err.message));

// ── ROUTES ──────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/produits',  require('./routes/produitRoutes'));
app.use('/api/commandes', require('./routes/commandeRoutes'));
app.use('/api/users',     require('./routes/userRoutes'));

// Route de test (pour vérifier que le serveur tourne)
app.get('/', (req, res) => {
  res.json({ message: '🚀 API ElectroMaison opérationnelle !' });
});

// ── GESTION DES ERREURS ──────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne', error: err.message });
});

// ── DÉMARRAGE DU SERVEUR ─────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌍 Serveur lancé sur http://localhost:${PORT}`);
});
