const express = require('express');
const router = express.Router();
const { listerAvisProduit, creerAvis } = require('../controllers/avisController');
const { proteger, client } = require('../middleware/authMiddleware');

router.get('/produit/:produitId', listerAvisProduit);
router.post('/', proteger, client, creerAvis);

module.exports = router;
