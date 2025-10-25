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
    foundOn: ["metallic-asteroids", "carbonite-asteroids", "silicate-asteroids"],
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
    foundOn: ["CV4", "MM3", "TW2", "TW3"],
  },
  bauxite: {
    id: "bauxite",
    foundOn: ["BT3"],
  },
  calcite: {
    id: "calcite",
    foundOn: ["BT4", "CC2", "CC3", "CV2", "TW3"],
  },
  chromite: {
    id: "chromite",
    foundOn: ["TW1"],
  },
  cobalt: {
    id: "cobalt",
    foundOn: ["CV4", "MM1", "TW3"],
  },
  copper: {
    id: "copper",
    foundOn: ["BT2", "CC2", "CV2", "MM4"],
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
    foundOn: ["BT2", "TW4"],
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
    foundOn: ["CV4", "TW1"],
  },
  nickel: {
    id: "nickel",
    foundOn: ["BT2", "CC1", "CC4", "MM2", "TW2"],
  },
  obsidian: {
    id: "obsidian",
    foundOn: ["BT3"],
  },
  platinum: {
    id: "platinum",
    foundOn: ["BT1", "CV2", "MM1", "TW4"],
  },
  rutile: {
    id: "rutile",
    foundOn: ["CC3", "CV1"],
  },
  salt: {
    id: "salt",
    foundOn: ["BT1", "MM3", "TW3"],
  },
  silver: {
    id: "silver",
    foundOn: ["BT2", "CC4", "CV1", "MM4", "TW1"],
  },

  // Gems (Flawless)
  aquamarine: {
    id: "aquamarine",
    foundOn: ["CV3"],
  },
  citrine: {
    id: "citrine",
    foundOn: ["BT3", "TW4"],
  },
  emerald: {
    id: "emerald",
    foundOn: ["CV3"],
  },
  opal: {
    id: "opal",
    foundOn: ["BT1", "TW2"],
  },
  ruby: {
    id: "ruby",
    foundOn: ["CV1", "TW3"],
  },
  sapphire: {
    id: "sapphire",
    foundOn: ["CV3", "MM2", "MM3"],
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
    foundOn: ["BT3", "TW4"],
  },
  "cracked-emerald": {
    id: "cracked-emerald",
    foundOn: ["CV3"],
  },
  "cracked-opal": {
    id: "cracked-opal",
    foundOn: ["BT1", "TW2"],
  },
  "cracked-ruby": {
    id: "cracked-ruby",
    foundOn: ["CV1", "TW3"],
  },
  "cracked-sapphire": {
    id: "cracked-sapphire",
    foundOn: ["CV3", "MM2", "MM3"],
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
    foundOn: ["BT1", "CC4"],
  },
  mercury: {
    id: "mercury",
    foundOn: ["BT2"],
  },
  nitrogen: {
    id: "nitrogen",
    foundOn: ["CV4", "TW2"],
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
    foundOn: ["BT4", "CC1", "CC3", "CV2", "MM2", "TW1", "TW2"],
  },
  "metallic-asteroid-data": {
    id: "metallic-asteroid-data",
    foundOn: ["BT2", "CC4", "CV4", "MM1", "MM3"],
  },
  "silicate-asteroid-data": {
    id: "silicate-asteroid-data",
    foundOn: ["BT1", "BT3", "CC2", "CV1", "CV3", "MM4", "TW3", "TW4"],
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
