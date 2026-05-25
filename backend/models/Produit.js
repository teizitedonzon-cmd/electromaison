
const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du produit est obligatoire'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est obligatoire'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    prixAncien: {
      type: Number,
      default: null,
    },
    categorie: {
      type: String,
      required: [true, 'La catégorie est obligatoire'],
      trim: true,
    },
    vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    marque: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    badge: {
      type: String,
      enum: ['Promo', 'Nouveau', 'Best-seller', 'Vente flash', null],
      default: null,
    },
    noteMoyenne: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    nombreAvis: {
      type: Number,
      default: 0,
      min: 0,
    },
    venteFlash: {
      actif: { type: Boolean, default: false },
      prixFlash: { type: Number, default: null, min: 0 },
      dateFin: { type: Date, default: null },
    },
    actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

produitSchema.index({ nom: 'text', description: 'text', marque: 'text' });

module.exports = mongoose.model('Produit', produitSchema);
