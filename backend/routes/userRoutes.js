const express = require('express');
const router = express.Router();
const { proteger, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const upload = require('../middleware/uploadMiddleware');
const { envoyerEmailDecisionVendeur } = require('../utils/emailService');

router.get('/', proteger, admin, async (req, res) => {
  try {
    const users = await User.find().select('-motDePasse').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/profil', proteger, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-motDePasse');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profil', proteger, upload.single('photoProfil'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const telephoneBrute = String(req.body.telephone || '').trim();
    let telephone = user.telephone;
    if (telephoneBrute !== '') {
      const chiffres = telephoneBrute.replace(/\D/g, '');
      if (/^237\d{9}$/.test(chiffres)) {
        telephone = `+${chiffres}`;
      } else if (/^\d{9}$/.test(chiffres)) {
        telephone = `+237${chiffres}`;
      } else if (/^\+237\d{9}$/.test(telephoneBrute)) {
        telephone = telephoneBrute;
      } else {
        return res.status(400).json({ message: 'Le téléphone doit être au format +237 suivi de 9 chiffres.' });
      }
    }

    user.nom = String(req.body.nom || user.nom).trim();
    user.prenom = String(req.body.prenom || user.prenom).trim();
    const emailBrute = String(req.body.email || user.email).trim().toLowerCase();
    if (!emailBrute) {
      return res.status(400).json({ message: 'L email est requis.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailBrute)) {
      return res.status(400).json({ message: 'Adresse email invalide.' });
    }
    if (emailBrute !== user.email) {
      const emailExistant = await User.findOne({ email: emailBrute });
      if (emailExistant && emailExistant._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }
      user.email = emailBrute;
    }
    user.telephone = telephone;
    if (req.file) user.photoProfil = req.file.path;

    // Modification du mot de passe : exiger l'ancien mot de passe
    if (req.body.motDePasse) {
      const nouveau = String(req.body.motDePasse || '').trim();
      const ancien = String(req.body.currentMotDePasse || '').trim();
      if (nouveau.length < 6) {
        return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caracteres.' });
      }
      if (!ancien) {
        return res.status(400).json({ message: "L'ancien mot de passe est requis pour le changement." });
      }
      const valide = await user.verifierMotDePasse(ancien);
      if (!valide) {
        return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
      }
      user.motDePasse = nouveau;
    }

    const misAJour = await user.save();
    res.json({
      message: 'Profil mis a jour',
      user: {
        _id: misAJour._id,
        nom: misAJour.nom,
        prenom: misAJour.prenom,
        email: misAJour.email,
        role: misAJour.role,
        statutVendeur: misAJour.statutVendeur,
        telephone: misAJour.telephone,
        photoProfil: misAJour.photoProfil
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/actif', proteger, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { actif: req.body.actif },
      { new: true, runValidators: true }
    ).select('-motDePasse');

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json({ message: 'Statut mis a jour', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/statut-vendeur', proteger, admin, async (req, res) => {
  try {
    const { statutVendeur } = req.body;
    if (!['en_attente', 'approuve', 'rejete'].includes(statutVendeur)) {
      return res.status(400).json({ message: 'Statut vendeur invalide' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { statutVendeur },
      { new: true, runValidators: true }
    ).select('-motDePasse');

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (['approuve', 'rejete'].includes(statutVendeur)) {
      envoyerEmailDecisionVendeur(user, statutVendeur).catch((err) => {
        console.error('Erreur email decision vendeur:', err.message);
      });
    }
    res.json({ message: 'Statut vendeur mis a jour', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
