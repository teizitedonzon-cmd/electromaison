const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { genererToken } = require('../controllers/authController');

const proteger = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-motDePasse');

      if (!req.user || req.user.actif === false) {
        return res.status(401).json({ message: 'Compte introuvable ou desactive' });
      }

      if (req.user.role !== 'admin') {
        res.setHeader('x-refresh-token', genererToken(req.user));
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Session expiree ou token invalide' });
    }
  }

  return res.status(401).json({ message: 'Non autorise, aucun token' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Acces refuse : reserve aux administrateurs' });
};

const client = (req, res, next) => {
  if (req.user && req.user.role === 'client') {
    return next();
  }
  return res.status(403).json({ message: 'Acces refuse : reserve aux clients' });
};

const vendeur = (req, res, next) => {
  if (req.user && req.user.role === 'vendeur' && req.user.statutVendeur === 'approuve') {
    return next();
  }
  return res.status(403).json({ message: 'Acces refuse : reserve aux vendeurs approuves' });
};

const vendeurOuAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  if (req.user && req.user.role === 'vendeur' && req.user.statutVendeur === 'approuve') {
    return next();
  }

  return res.status(403).json({ message: 'Acces refuse : vendeur non approuve' });
};

module.exports = { proteger, admin, client, vendeur, vendeurOuAdmin };
