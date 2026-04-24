// routes/commandeRoutes.js
const express = require('express');
const router  = express.Router();
const {
  passerCommande, mesCommandes,
  toutesLesCommandes, changerStatut, statistiques
} = require('../controllers/commandeController');
const { proteger, adminSeulement } = require('../middleware/authMiddleware');

router.post('/',                proteger, passerCommande);
router.get('/mes-commandes',    proteger, mesCommandes);
router.get('/',                 proteger, adminSeulement, toutesLesCommandes);
router.get('/stats',            proteger, adminSeulement, statistiques);
router.put('/:id/statut',       proteger, adminSeulement, changerStatut);

module.exports = router;
