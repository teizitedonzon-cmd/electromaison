// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Dossier où les images sont sauvegardées
//   },
//   filename: (req, file, cb) => {
//     // Nom unique : timestamp + nom original
//     const nom = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
//     cb(null, nom);
//   },
// });

// // Filtrer : accepter seulement les images
// const filtreImages = (req, file, cb) => {
//   const typesAcceptes = /jpeg|jpg|png|webp/;
//   const estValide = typesAcceptes.test(
//     path.extname(file.originalname).toLowerCase()
//   );
//   if (estValide) {
//     cb(null, true);
//   } else {
//     cb(new Error('Seulement les images JPG, PNG et WEBP sont acceptées'));
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter: filtreImages,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB par image
// });

// module.exports = upload;






// ============================================
// middleware/uploadMiddleware.js
// Avant : multer stockait dans /uploads local
// Maintenant : multer envoie sur Cloudinary
// La signature est identique → routes inchangées
// ============================================
const { upload } = require('../config/cloudinary');

module.exports = upload;
