const mongoose = require('mongoose');
const Commande = require('../models/Commande');
const Produit = require('../models/Produit');
const Notification = require('../models/Notification');

exports.passerCommande = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { lignes, adresseLivraison, modePaiement, notes } = req.body;

    if (!Array.isArray(lignes) || lignes.length === 0) {
      return res.status(400).json({ message: 'Le panier est vide.' });
    }

    let montantTotal = 0;
    const lignesVerifiees = [];
    let commande;

    await session.withTransaction(async () => {
      for (const ligne of lignes) {
        const quantite = Number(ligne.quantite);
        if (!ligne.produitId || !Number.isInteger(quantite) || quantite <= 0) {
          throw new Error('Ligne de commande invalide.');
        }

        const produit = await Produit.findOneAndUpdate(
          { _id: ligne.produitId, actif: true, stock: { $gte: quantite } },
          { $inc: { stock: -quantite } },
          { new: true, session }
        );

        if (!produit) {
          throw new Error(`Produit "${ligne.nomProduit || 'selectionne'}" indisponible ou stock insuffisant.`);
        }

        const venteFlashActive = produit.venteFlash?.actif && produit.venteFlash?.prixFlash && produit.venteFlash?.dateFin && new Date(produit.venteFlash.dateFin) > new Date();
        const prixUnitaire = venteFlashActive ? produit.venteFlash.prixFlash : produit.prix;
        const sousTotal = prixUnitaire * quantite;
        montantTotal += sousTotal;
        lignesVerifiees.push({
          produit: produit._id,
          vendeur: produit.vendeur,
          nomProduit: produit.nom,
          categorie: produit.categorie,
          prixUnitaire,
          quantite,
          sousTotal,
        });
      }

      const commandes = await Commande.create([{
        client: req.user._id,
        lignes: lignesVerifiees,
        adresseLivraison,
        montantTotal,
        modePaiement: modePaiement || 'cash',
        notes,
      }], { session });

      commande = commandes[0];

      await Notification.create(
        lignesVerifiees.map((ligne) => ({
          vendeurId: ligne.vendeur,
          type: 'produit_vendu',
          titre: 'Produit vendu',
          message: `${ligne.nomProduit} a ete commande en ${ligne.quantite} exemplaire(s).`,
          data: {
            commandeId: commande._id,
            produitId: ligne.produit,
            nomProduit: ligne.nomProduit,
            quantite: ligne.quantite,
            montant: ligne.sousTotal,
          },
        })),
        { session }
      );
    });

    res.status(201).json({ message: 'Commande passee avec succes !', commande });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erreur lors de la commande.' });
  } finally {
    session.endSession();
  }
};

exports.mesCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find({ client: req.user._id })
      .populate('lignes.produit', 'nom images')
      .sort({ createdAt: -1 });

    const commandesClient = commandes.map((commande) => {
      const obj = commande.toObject();
      obj.lignes = obj.lignes.map(({ vendeur, ...ligne }) => ligne);
      return obj;
    });

    res.json(commandesClient);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.mesVentes = async (req, res) => {
  try {
    const commandes = await Commande.find({ 'lignes.vendeur': req.user._id })
      .populate('client', 'nom prenom email telephone')
      .sort({ createdAt: -1 });

    const ventes = commandes.map((commande) => {
      const obj = commande.toObject();
      obj.lignes = obj.lignes.filter((ligne) => ligne.vendeur.toString() === req.user._id.toString());
      obj.montantVendeur = obj.lignes.reduce((total, ligne) => total + ligne.sousTotal, 0);
      return obj;
    });

    res.json({ commandes: ventes, total: ventes.length });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.toutesLesCommandes = async (req, res) => {
  try {
    const { statut, page = 1, limite = 20 } = req.query;
    const filtre = statut ? { statut } : {};
    const skip = (Number(page) - 1) * Number(limite);

    const total = await Commande.countDocuments(filtre);
    const commandes = await Commande.find(filtre)
      .populate('client', 'nom prenom email telephone')
      .populate('lignes.vendeur', 'nom prenom email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limite));

    res.json({ commandes, total, pages: Math.ceil(total / Number(limite)) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.changerStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true, runValidators: true }
    ).populate('client', 'nom prenom email');

    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
    res.json({ message: 'Statut mis a jour.', commande });
  } catch (error) {
    res.status(400).json({ message: 'Erreur.', error: error.message });
  }
};

exports.statistiques = async (req, res) => {
  try {
    const totalCommandes = await Commande.countDocuments();
    const enAttente = await Commande.countDocuments({ statut: 'en_attente' });
    const livrees = await Commande.countDocuments({ statut: 'livree' });

    const revenusAgg = await Commande.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $group: { _id: null, total: { $sum: '$montantTotal' } } },
    ]);
    const revenus = revenusAgg[0]?.total || 0;

    const parCategorie = await Commande.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $unwind: '$lignes' },
      { $lookup: { from: 'produits', localField: 'lignes.produit', foreignField: '_id', as: 'produit' } },
      { $unwind: '$produit' },
      { $group: { _id: '$produit.categorie', total: { $sum: '$lignes.sousTotal' }, quantite: { $sum: '$lignes.quantite' } } },
      { $sort: { total: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, label: '$_id', total: 1, quantite: 1 } }
    ]);

    const parVendeur = await Commande.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $unwind: '$lignes' },
      { $group: { _id: '$lignes.vendeur', total: { $sum: '$lignes.sousTotal' }, quantite: { $sum: '$lignes.quantite' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'vendeur' } },
      { $unwind: { path: '$vendeur', preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, label: { $concat: [{ $ifNull: ['$vendeur.prenom', 'Vendeur'] }, ' ', { $ifNull: ['$vendeur.nom', ''] }] }, total: 1, quantite: 1 } }
    ]);

    const parMois = await Commande.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $group: { _id: { annee: { $year: '$createdAt' }, mois: { $month: '$createdAt' } }, total: { $sum: '$montantTotal' } } },
      { $sort: { '_id.annee': 1, '_id.mois': 1 } },
      { $project: { _id: 0, label: { $concat: [{ $toString: '$_id.mois' }, '/', { $toString: '$_id.annee' }] }, total: 1 } },
    ]);

    res.json({ totalCommandes, enAttente, livrees, revenus, parCategorie, parVendeur, parMois });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};
