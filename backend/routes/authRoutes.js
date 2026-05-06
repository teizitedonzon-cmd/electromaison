
const express = require('express');
const router = express.Router();
const { inscription, connexion } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware'); // Ton middleware Multer

// On ajoute upload.single('photoProfil') ici
router.post('/inscription', upload.single('photoProfil'), inscription);
router.post('/connexion', connexion);

module.exports = router;