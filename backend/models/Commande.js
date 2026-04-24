// models/Commande.js — Modèle d'une commande client
const mongoose = require('mongoose');

// Schéma d'un article dans la commande
const ligneCommandeSchema = new mongoose.Schema({
  produit: {
    type: mongoose.Schema.Types.ObjectId, // Référence vers le produit
    ref: 'Produit',
    required: true,
  },
  nomProduit:  { type: String, required: true }, // Copie du nom (au cas où le produit est supprimé)
  prixUnitaire:{ type: Number, required: true },
  quantite:    { type: Number, required: true, min: 1 },
  sousTotal:   { type: Number, required: true },
});

const commandeSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lignes: [ligneCommandeSchema], // Liste des produits commandés

    // Adresse de livraison (copiée depuis le profil au moment de la commande)
    adresseLivraison: {
      rue:   { type: String, required: true },
      ville: { type: String, required: true },
      pays:  { type: String, required: true },
    },

    montantTotal: {
      type: Number,
      required: true,
    },
    fraisLivraison: {
      type: Number,
      default: 0,
    },

    statut: {
      type: String,
      enum: [
        'en_attente',    // Commande reçue, pas encore traitée
        'confirmee',     // Admin a confirmé la commande
        'en_livraison',  // En cours de livraison
        'livree',        // Livrée au client
        'annulee',       // Annulée
      ],
      default: 'en_attente',
    },

    modePaiement: {
      type: String,
      enum: ['cash', 'mobile_money', 'virement'],
      default: 'cash',
    },
    paiementConfirme: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String, // Commentaire de l'admin ou du client
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Commande', commandeSchema);
