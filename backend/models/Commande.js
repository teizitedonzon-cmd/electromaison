const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lignes: [{
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
    vendeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nomProduit: String,
    categorie: String,
    prixUnitaire: Number,
    quantite: { type: Number, required: true },
    sousTotal: Number
  }],
  montantTotal: { type: Number, required: true },
  reduction: { type: Number, default: 0 },
  codePromo: { type: String, uppercase: true, trim: true },
  adresseLivraison: {
    rue: String,
    ville: String,
    pays: { type: String, default: 'Cameroun' }
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'en_livraison', 'livree', 'annulee'],
    default: 'en_attente'
  },
  modePaiement: { type: String, default: 'cash' },
  notes: { type: String },
  dateCommande: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Commande', commandeSchema);
