const express = require('express');
const router = express.Router();
const {
  listerProduits,
  obtenirProduit,
  listerProduitsAdmin,
  mesProduits,
  creerProduit,
  modifierProduit,
  supprimerProduit
} = require('../controllers/produitController');
const { proteger, admin, vendeurOuAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', listerProduits);
router.get('/admin/tous', proteger, admin, listerProduitsAdmin);
router.get('/mes-produits', proteger, mesProduits);
router.post('/', proteger, vendeurOuAdmin, upload.array('images', 3), creerProduit);
router.put('/:id', proteger, vendeurOuAdmin, upload.array('images', 3), modifierProduit);
router.delete('/:id', proteger, vendeurOuAdmin, supprimerProduit);
router.get('/:id', obtenirProduit);

module.exports = router;
