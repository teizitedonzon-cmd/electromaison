
const express = require('express');
const router = express.Router();
const { inscription, connexion, refresh } = require('../controllers/authController');
const { proteger } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 


router.post('/inscription', upload.single('photoProfil'), inscription);
router.post('/connexion', connexion);
router.get('/refresh', proteger, refresh);

module.exports = router;
