// controllers/authController.js — Inscription & Connexion
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Fonction utilitaire : génère un token JWT
const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ── POST /api/auth/inscription ──────────────────────────────
exports.inscription = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, telephone } = req.body;

    // Vérifier si l'email existe déjà
    const existeDeja = await User.findOne({ email });
    if (existeDeja) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Créer le nouvel utilisateur (rôle "client" par défaut)
    const user = await User.create({ nom, prenom, email, motDePasse, telephone });

    const token = genererToken(user._id);

    res.status(201).json({
      message: 'Compte créé avec succès !',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'inscription.', error: error.message });
  }
};

// ── POST /api/auth/connexion ────────────────────────────────
exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    // Cherche l'utilisateur ET récupère le mot de passe (select: false par défaut)
    const user = await User.findOne({ email }).select('+motDePasse');

    if (!user || !(await user.verifierMotDePasse(motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (!user.actif) {
      return res.status(401).json({ message: 'Votre compte a été désactivé.' });
    }

    const token = genererToken(user._id);

    res.json({
      message: 'Connexion réussie !',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,        // "client" ou "admin" → pour rediriger dans React
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion.', error: error.message });
  }
};

// ── GET /api/auth/moi ───────────────────────────────────────
// Retourne le profil de l'utilisateur connecté
exports.moi = async (req, res) => {
  res.json({ user: req.user }); // req.user injecté par le middleware proteger
};

// ── PUT /api/auth/modifier-mot-de-passe ────────────────────
exports.modifierMotDePasse = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const user = await User.findById(req.user.id).select('+motDePasse');

    if (!(await user.verifierMotDePasse(ancienMotDePasse))) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
    }

    user.motDePasse = nouveauMotDePasse;
    await user.save(); // Le hook pre('save') va re-hacher automatiquement

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};
