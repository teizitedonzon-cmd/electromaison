
const cloudinary           = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer               = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer envoie directement sur Cloudinary
// req.files[i].path  → URL https://res.cloudinary.com/...
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'electromaison/produits',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation:  [
      { width: 900, height: 900, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
    ],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (ok.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Format non supporté. Utilisez jpg, png, webp ou gif.'), false);
  },
});

// Supprime une image Cloudinary à partir de son URL
const supprimerImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return;
    const regex = /\/electromaison\/produits\/([^/.]+)/;
    const match = imageUrl.match(regex);
    if (match) {
      await cloudinary.uploader.destroy(`electromaison/produits/${match[1]}`);
    }
  } catch (err) {
    console.error('Erreur suppression Cloudinary :', err.message);
  }
};

module.exports = { cloudinary, upload, supprimerImage };
