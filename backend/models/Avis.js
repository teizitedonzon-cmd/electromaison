const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commande: { type: mongoose.Schema.Types.ObjectId, ref: 'Commande', required: true },
  note: { type: Number, required: true, min: 1, max: 5 },
  commentaire: { type: String, trim: true, maxlength: 800 },
}, { timestamps: true });

avisSchema.index({ produit: 1, client: 1, commande: 1 }, { unique: true });

module.exports = mongoose.model('Avis', avisSchema);
