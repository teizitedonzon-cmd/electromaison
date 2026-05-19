export const CATEGORY_NAMES = [
  'Électronique',
  'Vêtements',
  'Alimentation',
  'Électroménager',
  'Beauté',
  'Immobilier',
  'Sport',
  'Autre',
];

const CATEGORY_ALIASES = [
  {
    standard: 'Électronique',
    aliases: ['Électronique', 'Electronique', 'electronique', 'électronique', 'Smartphone', 'Ordinateur', 'Tablette', 'iPhone', 'Samsung', 'Xiaomi', 'Huawei', 'Téléphone', 'Laptop', 'PC', 'Ordinateur portable'],
  },
  {
    standard: 'Vêtements',
    aliases: ['Vêtements', 'Vetements', 'vêtements', 'vetements', 'Mode', 'Habillement', 'Accessoire', 'T-shirt', 'Chemise', 'Pantalon', 'Robe', 'Jupe', 'Veste', 'Manteau', 'Chaussure', 'Basket'],
  },
  {
    standard: 'Alimentation',
    aliases: ['Alimentation', 'alimentation', 'Nourriture', 'nourriture', 'Riz', 'Pâtes', 'Pates', 'Farine', 'Sucre', 'Huile', 'Lait', 'Café', 'Cafe', 'Thé', 'The', 'Jus', 'Eau', 'Fruit', 'Légume', 'Legume'],
  },
  {
    standard: 'Électroménager',
    aliases: ['Électroménager', 'Electromenager', 'electromenager', 'électroménager', 'Appareil ménager', 'Appareil menager', 'Réfrigérateur', 'Refrigerateur', 'Four', 'Micro-ondes', 'Micro ondes', 'Lave-linge', 'Lave-vaisselle', 'Aspirateur', 'Fer à repasser', 'Fer a repasser', 'Cafetière', 'Cafetiere'],
  },
  {
    standard: 'Beauté',
    aliases: ['Beauté', 'Beaute', 'beauté', 'beaute', 'Cosmétique', 'Cosmetique', 'Parfum', 'Soin', 'Crème', 'Creme', 'Maquillage', 'Rouge à lèvres', 'Rouge a levres', 'Shampooing', 'Savon'],
  },
  {
    standard: 'Immobilier',
    aliases: ['Immobilier', 'immobilier', 'Maison', 'Appartement', 'Villa', 'Terrain', 'Bureau', 'Local', 'Studio'],
  },
  {
    standard: 'Sport',
    aliases: ['Sport', 'sport', 'Sports', 'Fitness', 'Vélo', 'Velo', 'Ballon', 'Tapis', 'Haltère', 'Haltere', 'Gant', 'Maillot', 'Chaussure de sport'],
  },
  {
    standard: 'Autre',
    aliases: ['Autre', 'autre', 'Other', 'other', 'Divers', 'undefined', 'null', ''],
  },
];

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const normalizeCategorie = (value) => {
  const raw = String(value || '').trim();
  if (!raw || ['undefined', 'null'].includes(raw.toLowerCase())) {
    return 'Autre';
  }

  const normalized = normalizeText(raw);

  for (const { standard, aliases } of CATEGORY_ALIASES) {
    for (const alias of aliases) {
      const normalizedAlias = normalizeText(alias);
      if (normalizedAlias === normalized || normalized.includes(normalizedAlias)) {
        return standard;
      }
    }
  }

  for (const name of CATEGORY_NAMES) {
    if (normalizeText(name) === normalized) {
      return name;
    }
  }

  return CATEGORY_NAMES.find((name) => normalizeText(name) === normalized) || raw;
};
