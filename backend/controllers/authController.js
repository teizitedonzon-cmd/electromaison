
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
  envoyerEmailAdminNouveauVendeur,
  envoyerEmailAdminConnexionVendeur,
  envoyerEmailNotificationInscription,
  envoyerEmailResetPassword,
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

const fichierUpload = (req, fieldName) => {
  if (req.files?.[fieldName]?.[0]) return req.files[fieldName][0].path;
  if (req.file && req.file.fieldname === fieldName) return req.file.path;
  return '';
};

const normaliserListe = (valeur) => {
  if (Array.isArray(valeur)) return valeur.map((v) => String(v).trim()).filter(Boolean);
  if (!valeur) return [];
  try {
    const parsed = JSON.parse(valeur);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
  } catch {}
  return String(valeur).split(',').map((v) => v.trim()).filter(Boolean);
};

// ── INSCRIPTION ──
exports.inscription = async (req, res) => {
  try {
    const { email, motDePasse, role } = req.body;
    const nom = String(req.body.nom || '').trim();
    const prenom = String(req.body.prenom || '').trim();
    const telephone = String(req.body.telephone || '').trim();
    const photoProfil = fichierUpload(req, 'photoProfil');

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
    const verificationVendeur = roleAutorise === 'vendeur'
      ? {
          nomComplet: String(req.body.nomComplet || '').trim(),
          numeroPieceIdentite: String(req.body.numeroPieceIdentite || '').trim(),
          photoIdentiteEnMain: fichierUpload(req, 'photoIdentiteEnMain'),
          villeResidence: String(req.body.villeResidence || '').trim(),
          quartierResidence: String(req.body.quartierResidence || '').trim(),
          typesProduits: normaliserListe(req.body.typesProduits),
          autreTypeProduit: String(req.body.autreTypeProduit || '').trim(),
          delaiExpedition: String(req.body.delaiExpedition || '').trim(),
          declarationAcceptee: req.body.declarationAcceptee === 'true' || req.body.declarationAcceptee === true,
          signatureElectronique: String(req.body.signatureElectronique || '').trim(),
          dateSignature: req.body.dateSignature ? new Date(req.body.dateSignature) : undefined,
          soumisLe: new Date(),
        }
      : undefined;

    const user = await User.create({
      nom, prenom, email, motDePasse,
      role: roleAutorise,
      statutVendeur,
      telephone, photoProfil,
      ...(verificationVendeur ? { verificationVendeur } : {})
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

    if (user.role === 'vendeur') {
      return res.status(201).json({
        message: 'Votre dossier vendeur a ete transmis. Votre compte est en attente de validation par l administrateur.',
        user: construireUserPublic(user)
      });
    }

    return res.status(201).json({
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
    const { email: mail } = req.body;
    const user = await User.findOne({ email: mail });

    // Si l'utilisateur n'existe pas, renvoyer message générique
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const motDePasseValide = await user.verifierMotDePasse(motDePasse);

    // Notifier l'admin d'une tentative de connexion vendeur (existante)
    if (user?.role === 'vendeur') {
      envoyerEmailAdminConnexionVendeur(user, motDePasseValide).catch((err) => {
        console.error('Erreur email connexion vendeur:', err.message);
      });
    }

    if (user.actif === false) {
      return res.status(403).json({ message: 'Votre compte est desactive' });
    }

    if (!motDePasseValide) {
      // Message d'erreur guidant l'utilisateur sans révéler trop d'information
      return res.status(401).json({ message: "Mot de passe incorrect. Si vous l'avez oublié, utilisez la page 'Mot de passe oublié' pour le réinitialiser." });
    }

    // Succès
    res.json({
      token: genererToken(user),
      user: construireUserPublic(user)
    });
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

// ── MOT DE PASSE OUBLIÉ ──
exports.motDePasseOublie = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis.' });

    const user = await User.findOne({ email });

    // Toujours renvoyer 200 pour éviter le fingerprinting d'emails
    if (!user) return res.json({ message: "Si un compte existe, vous recevrez un email pour réinitialiser le mot de passe." });

    // Générer token courte durée
    const token = jwt.sign({ purpose: 'reset_password', userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    try {
      await envoyerEmailResetPassword(user, token);
    } catch (err) {
      console.error('Erreur envoi email reset:', err.message);
      // Ne pas exposer l'erreur au client, renvoyer message générique
    }

    return res.json({ message: "Si un compte existe, vous recevrez un email pour réinitialiser le mot de passe." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── RÉINITIALISER LE MOT DE PASSE ──
exports.reinitialiserMotDePasse = async (req, res) => {
  try {
    const { token, motDePasse } = req.body;
    if (!token || !motDePasse) return res.status(400).json({ message: 'Token et nouveau mot de passe requis.' });
    if (String(motDePasse).length < 6) return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caracteres.' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Token invalide ou expiré.' });
    }

    if (payload.purpose !== 'reset_password' || !payload.userId) {
      return res.status(400).json({ message: 'Token invalide.' });
    }

    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    user.motDePasse = motDePasse;
    await user.save();

    return res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
