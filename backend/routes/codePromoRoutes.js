const express = require('express');
const router = express.Router();
const { verifierCodePromo, creerCodePromo, listerCodesPromo } = require('../controllers/codePromoController');
const { proteger, admin } = require('../middleware/authMiddleware');

router.post('/verifier', verifierCodePromo);
router.get('/', proteger, admin, listerCodesPromo);
router.post('/', proteger, admin, creerCodePromo);

module.exports = router;
