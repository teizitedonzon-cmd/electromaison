const Avis = require('../models/Avis');
const Commande = require('../models/Commande');
const Produit = require('../models/Produit');

const recalculerNoteProduit = async (produitId) => {
  const stats = await Avis.aggregate([
    { $match: { produit: produitId } },
    { $group: { _id: '$produit', moyenne: { $avg: '$note' }, total: { $sum: 1 } } },
  ]);

  await Produit.findByIdAndUpdate(produitId, {
    noteMoyenne: stats[0] ? Math.round(stats[0].moyenne * 10) / 10 : 0,
    nombreAvis: stats[0]?.total || 0,
  });
};

exports.listerAvisProduit = async (req, res) => {
  try {
    const avis = await Avis.find({ produit: req.params.produitId })
      .populate('client', 'nom prenom photoProfil')
      .sort({ createdAt: -1 });
    res.json({ avis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.creerAvis = async (req, res) => {
  try {
    const { produitId, commandeId, note, commentaire } = req.body;
    const noteNumerique = Number(note);

    if (!produitId || !commandeId || !Number.isInteger(noteNumerique) || noteNumerique < 1 || noteNumerique > 5) {
      return res.status(400).json({ message: 'Avis invalide.' });
    }

    const commande = await Commande.findOne({
      _id: commandeId,
      client: req.user._id,
      statut: 'livree',
      'lignes.produit': produitId,
    });

    if (!commande) {
      return res.status(403).json({ message: 'Vous pouvez noter uniquement un produit achete et livre.' });
    }

    const avis = await Avis.findOneAndUpdate(
      { produit: produitId, client: req.user._id, commande: commandeId },
      { note: noteNumerique, commentaire: String(commentaire || '').trim() },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('client', 'nom prenom photoProfil');

    await recalculerNoteProduit(avis.produit);
    res.status(201).json({ message: 'Avis enregistre.', avis });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
