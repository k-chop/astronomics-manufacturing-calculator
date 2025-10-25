export type RawMaterial = {
  id: string;
  foundOn: string[];
};

export type RawMaterialMap = {
  [itemId: string]: RawMaterial;
};

export const rawMaterials: RawMaterialMap = {
  // Aliases
  "any-gem": {
    id: "any-gem",
    foundOn: [],
  },

  // Surface Rocks
  carbon: {
    id: "carbon",
    foundOn: ["carbonite-asteroids"],
  },
  iron: {
    id: "iron",
    foundOn: ["metallic-asteroids"],
  },
  silica: {
    id: "silica",
    foundOn: ["silicate-asteroids"],
  },

  // Universal Resources
  biomass: {
    id: "biomass",
    foundOn: ["any"],
  },

  // Minerals
  amazonite: {
    id: "amazonite",
    foundOn: ["MM3", "TW2", "TW3", "CV4"],
  },
  bauxite: {
    id: "bauxite",
    foundOn: ["BT3"],
  },
  calcite: {
    id: "calcite",
    foundOn: ["CC2", "CC3", "TW3", "BT4", "CV2"],
  },
  chromite: {
    id: "chromite",
    foundOn: ["TW1"],
  },
  cobalt: {
    id: "cobalt",
    foundOn: ["MM1", "TW3", "CV4"],
  },
  copper: {
    id: "copper",
    foundOn: ["CC2", "MM4", "BT2", "CV2"],
  },
  diamond: {
    id: "diamond",
    foundOn: ["BT4"],
  },
  galena: {
    id: "galena",
    foundOn: ["MM1", "TW4"],
  },
  gold: {
    id: "gold",
    foundOn: ["TW4", "BT2"],
  },
  gypsum: {
    id: "gypsum",
    foundOn: ["CC1", "CV2"],
  },
  lodestone: {
    id: "lodestone",
    foundOn: ["BT1", "CV1"],
  },
  magnesite: {
    id: "magnesite",
    foundOn: ["TW1", "CV4"],
  },
  nickel: {
    id: "nickel",
    foundOn: ["CC1", "CC4", "MM2", "TW2", "BT2"],
  },
  obsidian: {
    id: "obsidian",
    foundOn: ["BT3"],
  },
  platinum: {
    id: "platinum",
    foundOn: ["MM1", "TW4", "BT1", "CV2"],
  },
  rutile: {
    id: "rutile",
    foundOn: ["CC3", "CV1"],
  },
  salt: {
    id: "salt",
    foundOn: ["MM3", "TW3", "BT1"],
  },
  silver: {
    id: "silver",
    foundOn: ["CC4", "MM4", "TW1", "BT2", "CV1"],
  },

  // Gems (Flawless)
  aquamarine: {
    id: "aquamarine",
    foundOn: ["CV3"],
  },
  citrine: {
    id: "citrine",
    foundOn: ["TW4", "BT3"],
  },
  emerald: {
    id: "emerald",
    foundOn: ["CV3"],
  },
  opal: {
    id: "opal",
    foundOn: ["TW2", "BT1"],
  },
  ruby: {
    id: "ruby",
    foundOn: ["TW3", "CV1"],
  },
  sapphire: {
    id: "sapphire",
    foundOn: ["MM2", "MM3", "CV3"],
  },
  topaz: {
    id: "topaz",
    foundOn: ["TW1"],
  },

  // Gems (Cracked)
  "cracked-aquamarine": {
    id: "cracked-aquamarine",
    foundOn: ["CV3"],
  },
  "cracked-citrine": {
    id: "cracked-citrine",
    foundOn: ["TW4", "BT3"],
  },
  "cracked-emerald": {
    id: "cracked-emerald",
    foundOn: ["CV3"],
  },
  "cracked-opal": {
    id: "cracked-opal",
    foundOn: ["TW2", "BT1"],
  },
  "cracked-ruby": {
    id: "cracked-ruby",
    foundOn: ["TW3", "CV1"],
  },
  "cracked-sapphire": {
    id: "cracked-sapphire",
    foundOn: ["MM2", "MM3", "CV3"],
  },
  "cracked-topaz": {
    id: "cracked-topaz",
    foundOn: ["TW1"],
  },

  // Liquids
  acid: {
    id: "acid",
    foundOn: ["BT3"],
  },
  brine: {
    id: "brine",
    foundOn: ["CC4", "BT1"],
  },
  mercury: {
    id: "mercury",
    foundOn: ["BT2"],
  },
  nitrogen: {
    id: "nitrogen",
    foundOn: ["TW2", "CV4"],
  },
  petroleum: {
    id: "petroleum",
    foundOn: ["BT4"],
  },
  water: {
    id: "water",
    foundOn: ["CC4", "CV3"],
  },

  // Data Resources - Composition
  "carbonite-asteroid-data": {
    id: "carbonite-asteroid-data",
    foundOn: ["CC1", "CC3", "MM2", "TW1", "TW2", "BT4", "CV2"],
  },
  "metallic-asteroid-data": {
    id: "metallic-asteroid-data",
    foundOn: ["CC4", "MM1", "MM3", "BT2", "CV4"],
  },
  "silicate-asteroid-data": {
    id: "silicate-asteroid-data",
    foundOn: ["CC2", "MM4", "TW3", "TW4", "BT1", "BT3", "CV1", "CV3"],
  },

  // Data Resources - Phenomenon
  "creature-data": {
    id: "creature-data",
    foundOn: ["CV3"],
  },
  "electrical-storm-data": {
    id: "electrical-storm-data",
    foundOn: ["CV4"],
  },
  "low-gravity-data": {
    id: "low-gravity-data",
    foundOn: ["CV1"],
  },
  "meteorite-data": {
    id: "meteorite-data",
    foundOn: ["CV2"],
  },
};

export function isRawMaterial(itemId: string): boolean {
  return itemId in rawMaterials;
}
