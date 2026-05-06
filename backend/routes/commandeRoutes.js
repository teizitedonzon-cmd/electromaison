const express = require('express');
const router = express.Router();
const {
  passerCommande,
  mesCommandes,
  mesVentes,
  toutesLesCommandes,
  changerStatut,
  statistiques
} = require('../controllers/commandeController');
const { proteger, admin, vendeurOuAdmin } = require('../middleware/authMiddleware');

router.post('/', proteger, passerCommande);
router.get('/mes-commandes', proteger, mesCommandes);
router.get('/mes-ventes', proteger, vendeurOuAdmin, mesVentes);
router.get('/stats', proteger, admin, statistiques);
router.get('/', proteger, admin, toutesLesCommandes);
router.put('/:id/statut', proteger, admin, changerStatut);

module.exports = router;
