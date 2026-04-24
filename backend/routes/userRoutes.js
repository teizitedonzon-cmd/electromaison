// routes/userRoutes.js
const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { proteger, adminSeulement } = require('../middleware/authMiddleware');

// GET /api/users — Lister tous les clients (Admin)
router.get('/', proteger, adminSeulement, async (req, res) => {
  try {
    const users = await User.find({ role: 'client' }).sort({ createdAt: -1 });
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/users/:id/actif — Activer/Désactiver un client (Admin)
router.put('/:id/actif', proteger, adminSeulement, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { actif: req.body.actif }, { new: true }
    );
    res.json({ message: 'Statut mis à jour.', user });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/users/profil — Modifier son propre profil (Client)
router.put('/profil', proteger, async (req, res) => {
  try {
    const { nom, prenom, telephone, adresse } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { nom, prenom, telephone, adresse }, { new: true, runValidators: true }
    );
    res.json({ message: 'Profil mis à jour.', user });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
