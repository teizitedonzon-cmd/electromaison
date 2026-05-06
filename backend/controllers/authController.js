// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const genererToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || '7d',
//   });
// };

// // ── INSCRIPTION ──
// exports.inscription = async (req, res) => {
//   try {
//     const { nom, prenom, email, motDePasse, telephone, role } = req.body;
//     const existeDeja = await User.findOne({ email });
//     if (existeDeja) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

//     const photoProfil = req.file ? `/uploads/${req.file.filename}` : undefined;

//     const user = await User.create({ 
//       nom, prenom, email, motDePasse, telephone, role, photoProfil 
//     });

//     const token = genererToken(user._id);
    
//     // CORRECTION : On renvoie TOUTES les infos pour que le profil soit complet
//     res.status(201).json({
//       token,
//       user: { 
//         id: user._id, 
//         _id: user._id, // Double sécurité pour MongoDB
//         nom: user.nom, 
//         prenom: user.prenom, 
//         email: user.email,
//         telephone: user.telephone,
//         role: user.role, 
//         photoProfil: user.photoProfil 
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ── CONNEXION ──
// exports.connexion = async (req, res) => {
//   try {
//     const { email, motDePasse } = req.body;
//     const user = await User.findOne({ email }).select('+motDePasse');

//     if (!user || !(await user.verifierMotDePasse(motDePasse))) {
//       return res.status(401).json({ message: 'Identifiants incorrects.' });
//     }

//     const token = genererToken(user._id);
    
//     // CORRECTION : On renvoie TOUTES les infos ici aussi
//     res.json({
//       token,
//       user: { 
//         id: user._id, 
//         _id: user._id,
//         nom: user.nom, 
//         prenom: user.prenom, 
//         email: user.email,
//         telephone: user.telephone,
//         role: user.role, 
//         photoProfil: user.photoProfil 
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.moi = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     res.json({ user });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.modifierMotDePasse = async (req, res) => {
//   try {
//     const { ancienMotDePasse, nouveauMotDePasse } = req.body;
//     const user = await User.findById(req.user.id).select('+motDePasse');
//     if (!(await user.verifierMotDePasse(ancienMotDePasse))) {
//       return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
//     }
//     user.motDePasse = nouveauMotDePasse;
//     await user.save();
//     res.json({ message: 'Mot de passe mis à jour avec succès !' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ── INSCRIPTION ──
exports.inscription = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role, telephone } = req.body;
    const photoProfil = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-avatar.png';

    const userExiste = await User.findOne({ email });
    if (userExiste) return res.status(400).json({ message: 'Cet email est déjà utilisé' });

    const roleAutorise = role === 'vendeur' ? 'vendeur' : 'client';
    const statutVendeur = roleAutorise === 'vendeur' ? 'en_attente' : 'non_applicable';

    const user = await User.create({
      nom, prenom, email, motDePasse,
      role: roleAutorise,
      statutVendeur,
      telephone, photoProfil
    });

    res.status(201).json({
      token: genererToken(user._id),
      user: { // Structuré pour le Frontend
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        statutVendeur: user.statutVendeur,
        photoProfil: user.photoProfil,
        telephone: user.telephone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── CONNEXION ──
exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ email });

    if (user && user.actif === false) {
      return res.status(403).json({ message: 'Votre compte est desactive' });
    }

    if (user && (await user.verifierMotDePasse(motDePasse))) {
      res.json({
        token: genererToken(user._id),
        user: { // Même structure ici
          _id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          statutVendeur: user.statutVendeur,
          photoProfil: user.photoProfil,
          telephone: user.telephone
        }
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
