// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema(
//   {
//     nom: { type: String, required: [true, 'Le nom est obligatoire'], trim: true },
//     prenom: { type: String, required: [true, 'Le prénom est obligatoire'], trim: true },
//     email: { type: String, required: [true, "L'email est obligatoire"], unique: true, lowercase: true, trim: true },
//     motDePasse: { type: String, required: [true, 'Le mot de passe est obligatoire'], minlength: [6, 'Minimum 6 caractères'], select: false },
//     role: { type: String, enum: ['client', 'vendeur', 'admin'], default: 'client' },
//     photoProfil: { type: String, default: '/uploads/default-avatar.png' },
//     telephone: { type: String, trim: true },
//     adresse: {
//       rue: { type: String },
//       ville: { type: String },
//       pays: { type: String, default: 'Cameroun' },
//     },
//     actif: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// // HOOK : Sécurité Admin Unique + Hachage
// userSchema.pre('save', async function (next) {
//   // On ne vérifie l'existence de l'admin que si on crée un admin ou change le rôle vers admin
//   if (this.isModified('role') && this.role === 'admin') {
//     const adminExiste = await mongoose.models.User.findOne({ role: 'admin' });
//     // Vérification : un admin existe déjà ET ce n'est pas l'utilisateur en cours d'édition[cite: 40]
//     if (adminExiste && adminExiste._id.toString() !== this._id.toString()) {
//       return next(new Error('Il ne peut y avoir qu’un seul administrateur global.'));
//     }
//   }

//   if (!this.isModified('motDePasse')) return next();
//   this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
//   next();
// });

// userSchema.methods.verifierMotDePasse = async function (motDePasseSaisi) {
//   return await bcrypt.compare(motDePasseSaisi, this.motDePasse);
// };

// module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true, minlength: [3, 'Le nom doit contenir au moins 3 caracteres'] },
  prenom: { type: String, required: true, trim: true, minlength: [3, 'Le prenom doit contenir au moins 3 caracteres'] },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDePasse: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ['client', 'vendeur', 'admin'], 
    default: 'client' 
  },
  statutVendeur: {
    type: String,
    enum: ['non_applicable', 'en_attente', 'approuve', 'rejete'],
    default: 'non_applicable'
  },
  nomBoutique: { type: String, trim: true },
  villeBoutique: { type: String, trim: true },
  telephone: {
    type: String,
    required: [true, 'Le numero de telephone est obligatoire'],
    trim: true,
    match: [/^\+237\d{9}$/, 'Le telephone doit etre au format +237 suivi de 9 chiffres']
  },
  adresse: {
    rue: { type: String },
    ville: { type: String },
    pays: { type: String, default: 'Cameroun' },
  },
  photoProfil: { type: String, default: '/uploads/default-avatar.png' },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('role') && this.role === 'admin') {
    const adminExiste = await mongoose.models.User.findOne({ role: 'admin' });
    if (adminExiste && adminExiste._id.toString() !== this._id.toString()) {
      return next(new Error('Il ne peut y avoir qu un seul administrateur global.'));
    }
  }

  if (!this.isModified('motDePasse')) return next();
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

userSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: 'admin' } }
);

userSchema.methods.verifierMotDePasse = async function(motDePasseSaisi) {
  return bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

module.exports = mongoose.model('User', userSchema);
