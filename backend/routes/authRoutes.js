// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const { inscription, connexion, moi, modifierMotDePasse } = require('../controllers/authController');
const { proteger } = require('../middleware/authMiddleware');

router.post('/inscription', inscription);
router.post('/connexion',   connexion);
router.get('/moi',          proteger, moi);
router.put('/mot-de-passe', proteger, modifierMotDePasse);

module.exports = router;
