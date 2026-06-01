const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true, default: '' },
  actif: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Categorie', categorieSchema);
