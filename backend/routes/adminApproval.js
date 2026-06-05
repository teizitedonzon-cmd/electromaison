const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { envoyerEmailDecisionVendeur } = require('../utils/emailService');

const router = express.Router();

// Point d'entrée pour les liens d'approbation / rejet envoyés par email
router.get('/vendor-action', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Token manquant');

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== 'vendor_approval') return res.status(400).send('Token invalide');

    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).send('Utilisateur introuvable');

    const action = payload.action;
    const newStatus = action === 'approve' ? 'approuve' : 'rejete';

    if (user.statutVendeur === newStatus) {
      return res.send(`<h2>Déjà ${newStatus}</h2><p>La décision a déjà été prise pour cet utilisateur.</p>`);
    }

    if (newStatus === 'rejete') {
      envoyerEmailDecisionVendeur(user, newStatus).catch((err) => console.error('Erreur email décision vendeur:', err.message));
      await User.findByIdAndDelete(user._id);
      return res.send(`<h2>Vendeur rejeté</h2><p>La demande a été rejetée et le compte a été supprimé.</p>`);
    }

    user.statutVendeur = newStatus;
    await user.save();

    // envoyer une confirmation au vendeur
    envoyerEmailDecisionVendeur(user, newStatus).catch((err) => console.error('Erreur email décision vendeur:', err.message));

    return res.send(`<h2>Vendeur ${newStatus}</h2><p>La décision a bien été enregistrée.</p>`);
  } catch (err) {
    console.error('Erreur validation token approbation:', err.message);
    return res.status(400).send('Token invalide ou expiré');
  }
});

module.exports = router;
