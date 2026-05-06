const express = require('express');
const router = express.Router();
const { proteger, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');

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

router.put('/profil', proteger, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    user.nom = req.body.nom || user.nom;
    user.prenom = req.body.prenom || user.prenom;
    user.telephone = req.body.telephone ?? user.telephone;
    if (req.body.motDePasse) user.motDePasse = req.body.motDePasse;

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
    res.json({ message: 'Statut vendeur mis a jour', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
