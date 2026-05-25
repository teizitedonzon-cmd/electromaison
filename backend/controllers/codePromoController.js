const CodePromo = require('../models/CodePromo');

const calculerReduction = (promo, total) => {
  if (!promo || total < promo.montantMinimum) return 0;
  const reduction = promo.type === 'montant'
    ? promo.valeur
    : Math.round((total * promo.valeur) / 100);
  return Math.min(reduction, total);
};

const trouverPromoValide = async (code, total = 0) => {
  const maintenant = new Date();
  const promo = await CodePromo.findOne({
    code: String(code || '').trim().toUpperCase(),
    actif: true,
    dateDebut: { $lte: maintenant },
    dateFin: { $gte: maintenant },
  });

  if (!promo) return { promo: null, message: 'Code promo invalide ou expire.' };
  if (promo.utilisationsMax > 0 && promo.utilisations >= promo.utilisationsMax) {
    return { promo: null, message: 'Ce code promo a atteint sa limite.' };
  }
  if (total < promo.montantMinimum) {
    return { promo: null, message: `Montant minimum requis : ${promo.montantMinimum.toLocaleString('fr-FR')} FCFA.` };
  }
  return { promo, reduction: calculerReduction(promo, total) };
};

exports.verifierCodePromo = async (req, res) => {
  try {
    const total = Number(req.body.total || 0);
    const resultat = await trouverPromoValide(req.body.code, total);
    if (!resultat.promo) return res.status(400).json({ message: resultat.message });
    res.json({
      code: resultat.promo.code,
      type: resultat.promo.type,
      valeur: resultat.promo.valeur,
      reduction: resultat.reduction,
      totalApresReduction: Math.max(total - resultat.reduction, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.creerCodePromo = async (req, res) => {
  try {
    const promo = await CodePromo.create(req.body);
    res.status(201).json({ message: 'Code promo cree.', promo });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.listerCodesPromo = async (req, res) => {
  try {
    const promos = await CodePromo.find().sort({ createdAt: -1 });
    res.json({ promos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trouverPromoValide = trouverPromoValide;
