const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { proteger, vendeurOuAdmin } = require('../middleware/authMiddleware');

router.get('/mes-notifications', proteger, vendeurOuAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find({ vendeurId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const nonLues = notifications.filter(n => !n.lu).length;
    res.json({ notifications, nonLues });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id/lire', proteger, vendeurOuAdmin, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, vendeurId: req.user._id },
      { lu: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/tout-lire', proteger, vendeurOuAdmin, async (req, res) => {
  try {
    await Notification.updateMany(
      { vendeurId: req.user._id, lu: false },
      { lu: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;