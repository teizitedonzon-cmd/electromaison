// controllers/produitController.js — CRUD complet des produits
const Produit = require('../models/Produit');

// ── GET /api/produits ─────────────────────────────────────
// Liste tous les produits (avec filtres, recherche, pagination)
exports.listerProduits = async (req, res) => {
  try {
    const { categorie, recherche, badge, minPrix, maxPrix, page = 1, limite = 12 } = req.query;

    // Construction du filtre dynamique
    const filtre = { actif: true };
    if (categorie)  filtre.categorie = categorie;
    if (badge)      filtre.badge = badge;
    if (minPrix || maxPrix) {
      filtre.prix = {};
      if (minPrix) filtre.prix.$gte = Number(minPrix);
      if (maxPrix) filtre.prix.$lte = Number(maxPrix);
    }
    if (recherche) {
      filtre.$text = { $search: recherche }; // Recherche full-text
    }

    const skip = (Number(page) - 1) * Number(limite);
    const total = await Produit.countDocuments(filtre);
    const produits = await Produit.find(filtre)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limite));

    res.json({
      produits,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limite)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

// ── GET /api/produits/:id ─────────────────────────────────
exports.getProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

// ── POST /api/produits ── (Admin seulement) ───────────────
// ── POST /api/produits ── (Admin seulement)
exports.creerProduit = async (req, res) => {
  try {
    // Si des images ont été uploadées, récupère leurs chemins
    const images = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];

    const produit = await Produit.create({ ...req.body, images });
    res.status(201).json({ message: 'Produit créé !', produit });
  } catch (error) {
    res.status(400).json({ message: 'Données invalides.', error: error.message });
  }
};

// ── PUT /api/produits/:id ── (Admin seulement)
exports.modifierProduit = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Si de nouvelles images sont uploadées, les ajouter
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const produit = await Produit.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json({ message: 'Produit modifié !', produit });
  } catch (error) {
    res.status(400).json({ message: 'Erreur.', error: error.message });
  }
};

// ── DELETE /api/produits/:id ── (Admin seulement) ─────────
// Suppression douce : on désactive plutôt que supprimer
exports.supprimerProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true }
    );
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json({ message: 'Produit supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

// ── GET /api/produits/admin/tous ── (Admin seulement) ─────
// Voir TOUS les produits (y compris les désactivés)
exports.tousLesProduits = async (req, res) => {
  try {
    const produits = await Produit.find().sort({ createdAt: -1 });
    res.json({ produits, total: produits.length });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};
