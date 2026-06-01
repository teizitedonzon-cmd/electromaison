const Categorie = require('../models/Categorie');

// Lister toutes les catégories actives (public)
exports.listerCategories = async (req, res) => {
  try {
    const categories = await Categorie.find({ actif: true }).sort({ nom: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lister toutes les catégories (admin)
exports.listerCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Categorie.find().sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une catégorie (admin)
exports.creerCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;
    if (!nom || !nom.trim()) {
      return res.status(400).json({ message: 'Le nom de la catégorie est obligatoire.' });
    }
    const existe = await Categorie.findOne({ nom: { $regex: `^${nom.trim()}$`, $options: 'i' } });
    if (existe) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà.' });
    }
    const categorie = await Categorie.create({ nom: nom.trim(), description: description?.trim() || '' });
    res.status(201).json({ message: 'Catégorie créée.', categorie });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Modifier une catégorie (admin)
exports.modifierCategorie = async (req, res) => {
  try {
    const { nom, description, actif } = req.body;
    const categorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      { ...(nom && { nom: nom.trim() }), ...(description !== undefined && { description }), ...(actif !== undefined && { actif }) },
      { new: true, runValidators: true }
    );
    if (!categorie) return res.status(404).json({ message: 'Catégorie introuvable.' });
    res.json({ message: 'Catégorie mise à jour.', categorie });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une catégorie (admin)
exports.supprimerCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie introuvable.' });
    res.json({ message: 'Catégorie supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
