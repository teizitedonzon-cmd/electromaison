require('dotenv').config();
const mongoose = require('mongoose');
const Categorie = require('./models/Categorie');

const categoriesBase = [
  { nom: 'Électronique', description: 'Smartphones, ordinateurs, gadgets' },
  { nom: 'Vêtements', description: 'Mode et accessoires' },
  { nom: 'Alimentation', description: 'Produits alimentaires et boissons' },
  { nom: 'Electromenager', description: 'Appareils ménagers' },
  { nom: 'Beauté', description: 'Soins et cosmétiques' },
  { nom: 'Immobilier', description: 'Ventes et locations immobilières' },
  { nom: 'Sport', description: 'Articles et équipements sportifs' },
  { nom: 'Autre', description: 'Divers articles' },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connecté à MongoDB');
  for (const cat of categoriesBase) {
    const existe = await Categorie.findOne({ nom: { $regex: `^${cat.nom}$`, $options: 'i' } });
    if (!existe) {
      await Categorie.create(cat);
      console.log(`✅ Créée : ${cat.nom}`);
    } else {
      console.log(`⏭️  Existe déjà : ${cat.nom}`);
    }
  }
  console.log('Terminé.');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
