// controllers/commandeController.js — Gestion des commandes
const Commande = require('../models/Commande');
const Produit  = require('../models/Produit');

// ── POST /api/commandes ── (Client connecté) ──────────────
// Passer une commande depuis le panier
exports.passerCommande = async (req, res) => {
  try {
    const { lignes, adresseLivraison, modePaiement, notes } = req.body;

    if (!lignes || lignes.length === 0) {
      return res.status(400).json({ message: 'Le panier est vide.' });
    }

    // Recalculer les prix côté serveur (sécurité : ne pas faire confiance au client)
    let montantTotal = 0;
    const lignesVerifiees = [];

    for (const ligne of lignes) {
      const produit = await Produit.findById(ligne.produitId);
      if (!produit || !produit.actif) {
        return res.status(400).json({ message: `Produit "${ligne.nomProduit}" indisponible.` });
      }
      if (produit.stock < ligne.quantite) {
        return res.status(400).json({ message: `Stock insuffisant pour "${produit.nom}".` });
      }
      const sousTotal = produit.prix * ligne.quantite;
      montantTotal += sousTotal;
      lignesVerifiees.push({
        produit: produit._id,
        nomProduit: produit.nom,
        prixUnitaire: produit.prix,
        quantite: ligne.quantite,
        sousTotal,
      });
      // Décrémenter le stock
      produit.stock -= ligne.quantite;
      await produit.save();
    }

    const commande = await Commande.create({
      client: req.user._id,
      lignes: lignesVerifiees,
      adresseLivraison,
      montantTotal,
      modePaiement: modePaiement || 'cash',
      notes,
    });

    res.status(201).json({ message: 'Commande passée avec succès !', commande });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

// ── GET /api/commandes/mes-commandes ── (Client) ──────────
exports.mesCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find({ client: req.user._id })
      .populate('lignes.produit', 'nom images') // Récupère les infos du produit lié
      .sort({ createdAt: -1 });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

// ── GET /api/commandes ── (Admin) ─────────────────────────
exports.toutesLesCommandes = async (req, res) => {
  try {
    const { statut, page = 1, limite = 20 } = req.query;
    const filtre = statut ? { statut } : {};
    const skip = (Number(page) - 1) * Number(limite);

    const total = await Commande.countDocuments(filtre);
    const commandes = await Commande.find(filtre)
      .populate('client', 'nom prenom email telephone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limite));

    res.json({ commandes, total, pages: Math.ceil(total / Number(limite)) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

// ── PUT /api/commandes/:id/statut ── (Admin) ──────────────
exports.changerStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true, runValidators: true }
    ).populate('client', 'nom prenom email');

    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
    res.json({ message: 'Statut mis à jour.', commande });
  } catch (error) {
    res.status(400).json({ message: 'Erreur.', error: error.message });
  }
};

// ── GET /api/commandes/stats ── (Admin) ───────────────────
exports.statistiques = async (req, res) => {
  try {
    const totalCommandes = await Commande.countDocuments();
    const enAttente     = await Commande.countDocuments({ statut: 'en_attente' });
    const livrees       = await Commande.countDocuments({ statut: 'livree' });

    const revenusAgg = await Commande.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $group: { _id: null, total: { $sum: '$montantTotal' } } },
    ]);
    const revenus = revenusAgg[0]?.total || 0;

    res.json({ totalCommandes, enAttente, livrees, revenus });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};
