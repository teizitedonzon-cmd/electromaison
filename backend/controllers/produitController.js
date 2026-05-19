
const Produit  = require('../models/Produit');
const Commande = require('../models/Commande');
const { supprimerImage } = require('../config/cloudinary');

const produitDejaCommande = (produitId) =>
  Commande.exists({ 'lignes.produit': produitId });

const normaliserTexte = (value = '') =>
  String(value)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const categoriesCanon = [
  { value: 'Électronique', aliases: ['electronique', 'electronics', 'lectron'] },
  { value: 'Vêtements', aliases: ['vetements', 'vetement', 'mode', 'tement'] },
  { value: 'Alimentation', aliases: ['alimentation', 'alimentaire'] },
  { value: 'Electromenager', aliases: ['electromenager', 'menager'] },
  { value: 'Beauté', aliases: ['beaute', 'beauty', 'beaut'] },
  { value: 'Immobilier', aliases: ['immobilier', 'maison', 'appartement', 'villa', 'terrain', 'bureau', 'local', 'studio'] },
  { value: 'Sport', aliases: ['sport', 'sports'] },
  { value: 'Autre', aliases: ['autre', 'divers'] },
];

const categorieCanonique = (categorie) => {
  const normalized = normaliserTexte(categorie);
  const match = categoriesCanon.find((cat) =>
    cat.aliases.some((alias) => normalized.includes(alias))
  );
  return match ? match.value : String(categorie || '').trim();
};

const regexCategorie = (categorie) => {
  const normalized = normaliserTexte(categorie);
  const match = categoriesCanon.find((cat) =>
    cat.aliases.some((alias) => normalized.includes(alias))
  );
  const terms = match ? [match.value, ...match.aliases] : [String(categorie || '').trim()];
  const escaped = terms
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return { $regex: escaped.join('|'), $options: 'i' };
};

// ── LISTER LES PRODUITS (Public) ─────────────
// ✅ Aucun changement
exports.listerProduits = async (req, res) => {
  try {
    const { categorie, recherche, page = 1, limite = 12, minPrix, maxPrix } = req.query;
    const filtre = { actif: true };
    if (categorie) {
      filtre.categorie = regexCategorie(categorie);
    }
    if (recherche) filtre.$text = { $search: recherche };
    if (minPrix || maxPrix) {
      filtre.prix = {};
      if (minPrix) filtre.prix.$gte = Number(minPrix);
      if (maxPrix) filtre.prix.$lte = Number(maxPrix);
    }

    const produits = await Produit.find(filtre)
      .select('-vendeur')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limite))
      .limit(Number(limite));

    const total = await Produit.countDocuments(filtre);
    res.json({ produits, total, pages: Math.ceil(total / limite) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── MES PRODUITS (Vendeur) ────────────────────
// ✅ Aucun changement
exports.mesProduits = async (req, res) => {
  try {
    const produits = await Produit.find({ vendeur: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ produits, total: produits.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DÉTAIL PRODUIT (Public) ───────────────────
// ✅ Aucun changement
exports.obtenirProduit = async (req, res) => {
  try {
    const produit = await Produit.findOne({ _id: req.params.id, actif: true })
      .select('-vendeur');
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── LISTE ADMIN ───────────────────────────────
// ✅ Aucun changement
exports.listerProduitsAdmin = async (req, res) => {
  try {
    const produits = await Produit.find()
      .populate('vendeur', 'nom prenom')
      .sort({ createdAt: -1 });
    res.json({ produits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── CRÉER UN PRODUIT ──────────────────────────
exports.creerProduit = async (req, res) => {
  try {
    if (Number(req.body.prix) < 0 || Number(req.body.stock) < 0) {
      return res.status(400).json({ message: 'Prix et stock doivent etre positifs.' });
    }

    // ✅ SEUL CHANGEMENT : f.path (URL Cloudinary https://...)
    // Avant : req.files.map(f => `/uploads/${f.filename}`)
    const images = req.files ? req.files.map((f) => f.path) : [];

    const nouveauProduit = await Produit.create({
      ...req.body,
      categorie: categorieCanonique(req.body.categorie),
      images,
      vendeur: req.user._id,
    });

    res.status(201).json({ message: 'Produit mis en vente !', produit: nouveauProduit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ── MODIFIER UN PRODUIT ───────────────────────
exports.modifierProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });

    if (
      produit.vendeur.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres produits.' });
    }

    const updates = { ...req.body };
    if (updates.categorie !== undefined) {
      updates.categorie = categorieCanonique(updates.categorie);
    }

    if (
      (updates.prix  !== undefined && Number(updates.prix)  < 0) ||
      (updates.stock !== undefined && Number(updates.stock) < 0)
    ) {
      return res.status(400).json({ message: 'Prix et stock doivent etre positifs.' });
    }

    // ✅ SEUL CHANGEMENT : f.path + suppression anciennes images Cloudinary
    if (req.files && req.files.length > 0) {
      // Supprimer les anciennes images du cloud avant de les remplacer
      if (produit.images && produit.images.length > 0) {
        await Promise.all(produit.images.map((url) => supprimerImage(url)));
      }
      // Nouvelles URLs Cloudinary
      updates.images = req.files.map((f) => f.path);
    }

    if (req.user.role !== 'admin' && (await produitDejaCommande(produit._id))) {
      return res.status(400).json({
        message: 'Ce produit a deja ete commande. Vous ne pouvez plus le modifier.',
      });
    }

    const produitModifie = await Produit.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    res.json(produitModifie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ── SUPPRIMER UN PRODUIT ──────────────────────
exports.supprimerProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });

    if (
      produit.vendeur.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Action non autorisee.' });
    }

    const dejaCommande = await produitDejaCommande(produit._id);

    if (dejaCommande && req.user.role !== 'admin') {
      return res.status(400).json({
        message: 'Ce produit a deja ete commande. Vous ne pouvez plus le supprimer.',
      });
    }

    if (dejaCommande && req.user.role === 'admin') {
      produit.actif = false;
      await produit.save();
      return res.json({ message: 'Produit desactive car il est lie a une commande.' });
    }

    // ✅ SEUL CHANGEMENT : supprimer les images de Cloudinary avant de supprimer le produit
    if (produit.images && produit.images.length > 0) {
      await Promise.all(produit.images.map((url) => supprimerImage(url)));
    }

    await Produit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produit supprime.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
