const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
      next();
    } catch (error) {
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Non autorisé, aucun token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé : réservé aux administrateurs' });
  }
};

const vendeurOuAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  if (req.user && req.user.role === 'vendeur' && req.user.statutVendeur === 'approuve') {
    next();
  } else {
    res.status(403).json({ message: 'Acces refuse : vendeur non approuve' });
  }
};

module.exports = { proteger, admin, vendeurOuAdmin };
