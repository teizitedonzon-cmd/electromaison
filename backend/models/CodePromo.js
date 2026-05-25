const mongoose = require('mongoose');

const codePromoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['pourcentage', 'montant'], default: 'pourcentage' },
  valeur: { type: Number, required: true, min: 0 },
  dateDebut: { type: Date, default: Date.now },
  dateFin: { type: Date, required: true },
  montantMinimum: { type: Number, default: 0, min: 0 },
  utilisationsMax: { type: Number, default: 0, min: 0 },
  utilisations: { type: Number, default: 0, min: 0 },
  actif: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('CodePromo', codePromoSchema);
