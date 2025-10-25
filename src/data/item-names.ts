export type LocalizedNames = {
  en: string;
  // 将来的に他の言語を追加
  // ja?: string;
};
export type Locale = keyof LocalizedNames;

export type ItemNamesMap = {
  [itemId: string]: LocalizedNames;
};

export const itemNames: ItemNamesMap = {
  // Aliases
  "any-gem": { en: "Any Gem" },

  // Raw Materials - Surface Rocks
  carbon: { en: "Carbon" },
  iron: { en: "Iron" },
  silica: { en: "Silica" },

  // Raw Materials - Universal
  biomass: { en: "Biomass" },

  // Raw Materials - Minerals
  amazonite: { en: "Amazonite" },
  bauxite: { en: "Bauxite" },
  calcite: { en: "Calcite" },
  chromite: { en: "Chromite" },
  cobalt: { en: "Cobalt" },
  copper: { en: "Copper" },
  diamond: { en: "Diamond" },
  galena: { en: "Galena" },
  gold: { en: "Gold" },
  gypsum: { en: "Gypsum" },
  lodestone: { en: "Lodestone" },
  magnesite: { en: "Magnesite" },
  nickel: { en: "Nickel" },
  obsidian: { en: "Obsidian" },
  platinum: { en: "Platinum" },
  rutile: { en: "Rutile" },
  salt: { en: "Salt" },
  silver: { en: "Silver" },

  // Raw Materials - Gems (Flawless)
  aquamarine: { en: "Aquamarine" },
  citrine: { en: "Citrine" },
  emerald: { en: "Emerald" },
  opal: { en: "Opal" },
  ruby: { en: "Ruby" },
  sapphire: { en: "Sapphire" },
  topaz: { en: "Topaz" },

  // Raw Materials - Gems (Cracked)
  "cracked-aquamarine": { en: "Cracked Aquamarine" },
  "cracked-citrine": { en: "Cracked Citrine" },
  "cracked-emerald": { en: "Cracked Emerald" },
  "cracked-opal": { en: "Cracked Opal" },
  "cracked-ruby": { en: "Cracked Ruby" },
  "cracked-sapphire": { en: "Cracked Sapphire" },
  "cracked-topaz": { en: "Cracked Topaz" },

  // Raw Materials - Liquids
  acid: { en: "Acid" },
  brine: { en: "Brine" },
  mercury: { en: "Mercury" },
  nitrogen: { en: "Nitrogen" },
  petroleum: { en: "Petroleum" },
  water: { en: "Water" },

  // Raw Materials - Data
  "carbonite-asteroid-data": { en: "Carbonite Asteroid Data" },
  "metallic-asteroid-data": { en: "Metallic Asteroid Data" },
  "silicate-asteroid-data": { en: "Silicate Asteroid Data" },
  "creature-data": { en: "Creature Data" },
  "electrical-storm-data": { en: "Electrical Storm Data" },
  "low-gravity-data": { en: "Low Gravity Data" },
  "meteorite-data": { en: "Meteorite Data" },

  // Manufactured Items
  resin: { en: "Resin" },
  polymers: { en: "Polymers" },
  graphite: { en: "Graphite" },
  "glass-sheet": { en: "Glass Sheet" },
  "purified-water": { en: "Purified Water" },
  diesel: { en: "Diesel" },
  plastics: { en: "Plastics" },
  "steel-rods": { en: "Steel Rods" },
  "carbon-fiber": { en: "Carbon Fiber" },
  "copper-wire": { en: "Copper Wire" },
  hydrogel: { en: "Hydrogel" },
  "fiber-optic-strands": { en: "Fiber Optic Strands" },
  sand: { en: "Sand" },
  "magnetic-dust": { en: "Magnetic Dust" },
  "bauxite-dust": { en: "Bauxite Dust" },
  "gem-dust": { en: "Gem Dust" },

  // Research
  "asteroid-research": { en: "Asteroid Research" },
  "combustion-research": { en: "Combustion Research" },
  "optics-research": { en: "Optics Research" },
  "magnetic-field-research": { en: "Magnetic Field Research" },
  "buoyancy-research": { en: "Buoyancy Research" },
  "trajectory-research": { en: "Trajectory Research" },
  "conductivity-research": { en: "Conductivity Research" },
  "panspermia-research": { en: "Panspermia Research" },
};

export function getItemName(itemId: string, locale: string = "en"): string {
  const names = itemNames[itemId];
  if (!names) return itemId;
  return names[locale as keyof LocalizedNames] || names.en;
}

// 検索用：IDと表示名の両方でマッチング
export function searchItems(
  query: string,
  locale: string = "en",
): Array<{ id: string; name: string }> {
  const lowerQuery = query.toLowerCase();
  return Object.entries(itemNames)
    .filter(([id, names]) => {
      const name = names[locale as keyof LocalizedNames] || names.en;
      return (
        id.toLowerCase().includes(lowerQuery) ||
        name.toLowerCase().includes(lowerQuery)
      );
    })
    .map(([id, names]) => ({
      id,
      name: names[locale as keyof LocalizedNames] || names.en,
    }));
}
