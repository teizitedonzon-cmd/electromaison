const express = require('express');
const router  = express.Router();
const {
  listerProduits, getProduit, creerProduit,
  modifierProduit, supprimerProduit, tousLesProduits
} = require('../controllers/produitController');
const { proteger, adminSeulement } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Routes publiques
router.get('/',    listerProduits);
router.get('/:id', getProduit);

// Routes Admin
router.get('/admin/tous', proteger, adminSeulement, tousLesProduits);

// Upload jusqu'à 3 images par produit
router.post('/',   proteger, adminSeulement, upload.array('images', 3), creerProduit);
router.put('/:id', proteger, adminSeulement, upload.array('images', 3), modifierProduit);
router.delete('/:id', proteger, adminSeulement, supprimerProduit);

module.exports = router;