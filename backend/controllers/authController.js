
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
  envoyerEmailAdminNouveauVendeur,
  envoyerEmailAdminConnexionVendeur,
  envoyerEmailNotificationInscription,
} = require('../utils/emailService');

const construireUserPublic = (user) => ({
  _id: user._id,
  nom: user.nom,
  prenom: user.prenom,
  email: user.email,
  role: user.role,
  statutVendeur: user.statutVendeur,
  photoProfil: user.photoProfil,
  telephone: user.telephone
});

const genererToken = (user) => {
  const payload = { id: user._id, role: user.role };
  if (user.role === 'admin') return jwt.sign(payload, process.env.JWT_SECRET);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ── INSCRIPTION ──
exports.inscription = async (req, res) => {
  try {
    const { email, motDePasse, role } = req.body;
    const nom = String(req.body.nom || '').trim();
    const prenom = String(req.body.prenom || '').trim();
    const telephone = String(req.body.telephone || '').trim();
    const photoProfil = req.file ? req.file.path : '';

    if (nom.length < 3 || prenom.length < 3) {
      return res.status(400).json({ message: 'Le nom et le prenom doivent contenir au moins 3 caracteres.' });
    }

    if (!/^\+237\d{9}$/.test(telephone)) {
      return res.status(400).json({ message: 'Le telephone doit etre au format +237 suivi de 9 chiffres.' });
    }

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

    envoyerEmailNotificationInscription(user).catch((err) => {
      console.error('Erreur email notification inscription:', err.message);
    });

    if (user.role === 'vendeur') {
      // Générer tokens signés pour approbation et rejet (validité 7 jours)
      try {
        const tokenApprove = jwt.sign({ purpose: 'vendor_approval', userId: user._id, action: 'approve' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const tokenReject = jwt.sign({ purpose: 'vendor_approval', userId: user._id, action: 'reject' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        envoyerEmailAdminNouveauVendeur(user, tokenApprove, tokenReject).catch((err) => {
          console.error('Erreur email nouveau vendeur:', err.message);
        });
      } catch (err) {
        console.error('Erreur generation token approbation:', err.message);
      }
    }

    res.status(201).json({
      token: genererToken(user),
      user: construireUserPublic(user)
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
    const motDePasseValide = user ? await user.verifierMotDePasse(motDePasse) : false;

    if (user?.role === 'vendeur') {
      envoyerEmailAdminConnexionVendeur(user, motDePasseValide).catch((err) => {
        console.error('Erreur email connexion vendeur:', err.message);
      });
    }

    if (user && user.actif === false) {
      return res.status(403).json({ message: 'Votre compte est desactive' });
    }

    if (user && motDePasseValide) {
      res.json({
        token: genererToken(user),
        user: construireUserPublic(user)
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refresh = async (req, res) => {
  res.json({
    token: genererToken(req.user),
    user: construireUserPublic(req.user)
  });
};

exports.genererToken = genererToken;
