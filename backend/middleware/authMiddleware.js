// middleware/authMiddleware.js — Protection des routes par JWT
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── MIDDLEWARE : Vérifier que l'utilisateur est connecté ──
const proteger = async (req, res, next) => {
  let token;

  // Le token est envoyé dans le header : Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé. Veuillez vous connecter.' });
  }

  try {
    // Déchiffre le token pour récupérer l'ID utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupère l'utilisateur depuis la DB et l'attache à la requête
    req.user = await User.findById(decoded.id).select('-motDePasse');

    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }
    if (!req.user.actif) {
      return res.status(401).json({ message: 'Compte désactivé.' });
    }

    next(); // Passe au controller suivant
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

// ── MIDDLEWARE : Vérifier que l'utilisateur est admin ──
const adminSeulement = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Réservé aux administrateurs.' });
  }
};

module.exports = { proteger, adminSeulement };
