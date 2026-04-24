// models/User.js — Modèle de l'utilisateur (Admin ou Client)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est obligatoire'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,           // Un seul compte par email
      lowercase: true,
      trim: true,
    },
    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [6, 'Minimum 6 caractères'],
      select: false,          // Ne jamais renvoyer le mot de passe dans les requêtes
    },
    role: {
      type: String,
      enum: ['client', 'admin'], // Seulement ces deux valeurs possibles
      default: 'client',
    },
    telephone: {
      type: String,
      trim: true,
    },
    adresse: {
      rue:    { type: String },
      ville:  { type: String },
      pays:   { type: String, default: 'RDC' },
    },
    actif: {
      type: Boolean,
      default: true,          // Permet de désactiver un compte sans le supprimer
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  }
);

// ── HOOK : Hacher le mot de passe avant de sauvegarder ──
// Ce code s'exécute automatiquement avant chaque .save()
userSchema.pre('save', async function (next) {
  // Si le mot de passe n'a pas changé, on passe
  if (!this.isModified('motDePasse')) return next();
  // On hache le mot de passe (12 = niveau de sécurité)
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
  next();
});

// ── MÉTHODE : Vérifier le mot de passe lors de la connexion ──
userSchema.methods.verifierMotDePasse = async function (motDePasseSaisi) {
  return await bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

module.exports = mongoose.model('User', userSchema);
