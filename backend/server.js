// // ============================================
// // server.js — Point d'entrée du backend
// // ============================================
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');
// require('dotenv').config(); // Charge les variables du fichier .env

// const app = express();

// // ── MIDDLEWARES GLOBAUX ──────────────────────
// const defaultLocalOrigins = [
//   'http://localhost:3000',
//   'http://localhost:3001',
//   'http://localhost:5000',
//   'http://127.0.0.1:3000',
//   'http://127.0.0.1:3001',
//   'http://127.0.0.1:5000',
// ];

// const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

// const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
//   .split(',')
//   .map(normalizeOrigin)
//   .filter(Boolean);
// const allowedOrigins = Array.from(new Set([...defaultLocalOrigins.map(normalizeOrigin), ...configuredOrigins]));

// app.use(cors({
//   origin: (origin, callback) => {
//     const normalizedOrigin = origin ? normalizeOrigin(origin) : '';
//     if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
//     console.warn(`Origine CORS refusee: ${normalizedOrigin}`);
//     return callback(null, false);
//   },
//   credentials: true,
// }));
// app.use(express.json()); // Permet de lire le JSON dans les requêtes
// app.use(express.urlencoded({ extended: true }));

// // Dossier pour les images uploadées (accessibles via /uploads/...)
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
// app.use('/uploads', express.static(uploadsDir));

// // ── CONNEXION À MONGODB ──────────────────────
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ Connecté à MongoDB Atlas'))
//   .catch((err) => console.error('❌ Erreur MongoDB :', err.message));

// // ── ROUTES ──────────────────────────────────
// app.use('/api/auth',      require('./routes/authRoutes'));
// app.use('/api/produits',  require('./routes/produitRoutes'));
// app.use('/api/commandes', require('./routes/commandeRoutes'));
// app.use('/api/users',     require('./routes/userRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));

// // Route de test (pour vérifier que le serveur tourne)
// app.get('/api/health', (req, res) => {
//   res.json({ message: '🚀 API ElectroMaison opérationnelle !' });
// });

// if (process.env.NODE_ENV !== 'production') {
//   app.get('/', (req, res) => {
//     res.json({ message: '🚀 API ElectroMaison opérationnelle !' });
//   });
// }

// const clientBuildDir = path.join(__dirname, '..', 'frontend', 'build');
// if (process.env.NODE_ENV === 'production' && fs.existsSync(clientBuildDir)) {
//   app.use(express.static(clientBuildDir));
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(clientBuildDir, 'index.html'));
//   });
// }

// // ── GESTION DES ERREURS ──────────────────────
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Erreur serveur interne', error: err.message });
// });

// // ── DÉMARRAGE DU SERVEUR ─────────────────────
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🌍 Serveur lancé sur http://localhost:${PORT}`);
// });





// ============================================
// server.js — Point d'entrée du backend
// ✅ Changements par rapport à l'original :
//   1. Suppression du dossier /uploads statique
//      (images maintenant sur Cloudinary)
//   2. Ajout log Cloudinary dans /api/health
//   3. Ajout keep-alive pour Render gratuit
// Tout le reste est IDENTIQUE à l'original
// ============================================
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
require('dotenv').config();

const app = express();

// ── MIDDLEWARES GLOBAUX ──────────────────────
const defaultLocalOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5000',
];
const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);
const allowedOrigins = Array.from(
  new Set([...defaultLocalOrigins.map(normalizeOrigin), ...configuredOrigins])
);
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.includes(origin)) return true;
  if (allowVercelPreviews) {
    try {
      return new URL(origin).hostname.endsWith('.vercel.app');
    } catch {
      return false;
    }
  }
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    const normalizedOrigin = origin ? normalizeOrigin(origin) : '';
    if (isAllowedOrigin(normalizedOrigin))
      return callback(null, true);
    console.warn(`Origine CORS refusee: ${normalizedOrigin}`);
    return callback(null, false);
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SUPPRIMÉ : dossier /uploads local (images sur Cloudinary maintenant)
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
// app.use('/uploads', express.static(uploadsDir));

// ── CONNEXION À MONGODB ──────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err.message));

// ── ROUTES ──────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/produits',      require('./routes/produitRoutes'));
app.use('/api/commandes',     require('./routes/commandeRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ✅ MODIFIÉ : ajout du statut Cloudinary dans le health check
app.get('/api/health', (req, res) => {
  res.json({
    message:    '🚀 API ElectroMaison opérationnelle !',
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME
      ? `✅ Cloudinary connecté (${process.env.CLOUDINARY_CLOUD_NAME})`
      : '❌ Cloudinary NON configuré',
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({ message: '🚀 API ElectroMaison opérationnelle !' });
  });
}

const clientBuildDir = path.join(__dirname, '..', 'frontend', 'build');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientBuildDir)) {
  app.use(express.static(clientBuildDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildDir, 'index.html'));
  });
}

// ── GESTION DES ERREURS ──────────────────────
app.use((err, req, res, next) => {
  // Erreur taille fichier
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Image trop lourde (max 5 Mo)' });
  }
  // Erreur format fichier
  if (err.message && err.message.includes('Format non supporté')) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne', error: err.message });
});

// ✅ AJOUTÉ : keep-alive pour éviter la mise en veille sur Render gratuit
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  const https = require('https');
  setInterval(() => {
    https.get(`${process.env.RENDER_EXTERNAL_URL}/api/health`, (res) => {
      console.log(`💓 Keep-alive Render : ${res.statusCode}`);
    }).on('error', () => {});
  }, 14 * 60 * 1000);
}

// ── DÉMARRAGE DU SERVEUR ─────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌍 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`☁️  Cloudinary : ${process.env.CLOUDINARY_CLOUD_NAME || '⚠️  NON CONFIGURÉ'}`);
});
