const express = require('express');
const router = express.Router();
const {
  listerCategories,
  listerCategoriesAdmin,
  creerCategorie,
  modifierCategorie,
  supprimerCategorie,
} = require('../controllers/categorieController');
const { proteger, admin } = require('../middleware/authMiddleware');

router.get('/', listerCategories);
router.get('/admin/toutes', proteger, admin, listerCategoriesAdmin);
router.post('/', proteger, admin, creerCategorie);
router.put('/:id', proteger, admin, modifierCategorie);
router.delete('/:id', proteger, admin, supprimerCategorie);

module.exports = router;
