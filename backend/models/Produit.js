// models/Produit.js — Modèle d'un appareil électroménager
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
      type: Number, // Prix barré (pour afficher une promotion)
      default: null,
    },
    categorie: {
      type: String,
      required: [true, 'La catégorie est obligatoire'],
      enum: ['cuisine', 'froid', 'lavage', 'climatisation', 'petit_electromenager'],
    },
    marque: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Le stock ne peut pas être négatif'],
      default: 0,
    },
    images: {
      type: [String], // Tableau de chemins d'images
      default: [],
    },
    badge: {
      type: String,
      enum: ['Promo', 'Nouveau', 'Best-seller', null],
      default: null,
    },
    caracteristiques: {
      type: Map,       // Objet flexible : { "Puissance": "1200W", "Couleur": "Blanc" }
      of: String,
      default: {},
    },
    actif: {
      type: Boolean,
      default: true,  // Permet de masquer un produit sans le supprimer
    },
  },
  {
    timestamps: true,
  }
);

// Index de recherche texte (pour la barre de recherche)
produitSchema.index({ nom: 'text', description: 'text', marque: 'text' });

module.exports = mongoose.model('Produit', produitSchema);
