import type { AsteroidName } from "./asteroid";
import type { Locale, LocalizedNames } from "./item-names";

export type RawMaterialCategory = "surface" | "minerals" | "gems" | "liquids" | "gases" | "data";

export const rawMaterialCategoryNames: { [category in RawMaterialCategory]: LocalizedNames } = {
  surface: { en: "Surface Resources" },
  minerals: { en: "Minerals" },
  gems: { en: "Gems" },
  liquids: { en: "Liquids" },
  gases: { en: "Gases" },
  data: { en: "Data" },
};

export function getRawMaterialCategoryName(category: RawMaterialCategory, locale: Locale = "en"): string {
  return rawMaterialCategoryNames[category][locale] || rawMaterialCategoryNames[category].en;
}

export type RawMaterial = {
  id: string;
  category: RawMaterialCategory;
  foundOn: AsteroidName[];
};

export type RawMaterialMap = {
  [itemId: string]: RawMaterial;
};

export const rawMaterials: RawMaterialMap = {
  // Aliases
  "any-gem": {
    id: "any-gem",
    category: "gems",
    foundOn: [],
  },

  // Surface Rocks
  carbon: {
    id: "carbon",
    category: "surface",
    foundOn: ["carbonite-asteroids"],
  },
  iron: {
    id: "iron",
    category: "surface",
    foundOn: ["metallic-asteroids"],
  },
  silica: {
    id: "silica",
    category: "surface",
    foundOn: ["silicate-asteroids"],
  },

  // Universal Resources
  biomass: {
    id: "biomass",
    category: "surface",
    foundOn: ["any"],
  },

  // Minerals
  amazonite: {
    id: "amazonite",
    category: "minerals",
    foundOn: ["MM3", "TW2", "CV4"],
  },
  bauxite: {
    id: "bauxite",
    category: "minerals",
    foundOn: ["BT3", "NC4"],
  },
  calcite: {
    id: "calcite",
    category: "minerals",
    foundOn: ["CC2", "CC3", "TW3", "BT4", "CV2"],
  },
  chromite: {
    id: "chromite",
    category: "minerals",
    foundOn: ["TW1", "NC2"],
  },
  cobalt: {
    id: "cobalt",
    category: "minerals",
    foundOn: ["MM1", "TW2", "CV4"],
  },
  copper: {
    id: "copper",
    category: "minerals",
    foundOn: ["CC2", "MM4", "BT2", "CV2", "NC1"],
  },
  diamond: {
    id: "diamond",
    category: "minerals",
    foundOn: ["BT4", "NC4"],
  },
  galena: {
    id: "galena",
    category: "minerals",
    foundOn: ["MM1", "TW4"],
  },
  gold: {
    id: "gold",
    category: "minerals",
    foundOn: ["TW4", "BT2"],
  },
  gypsum: {
    id: "gypsum",
    category: "minerals",
    foundOn: ["CC1", "CV2", "NC3"],
  },
  lodestone: {
    id: "lodestone",
    category: "minerals",
    foundOn: ["BT1", "CV1", "NC2"],
  },
  magnesite: {
    id: "magnesite",
    category: "minerals",
    foundOn: ["TW1", "CV4"],
  },
  nickel: {
    id: "nickel",
    category: "minerals",
    foundOn: ["CC1", "CC4", "MM2", "TW2", "BT2", "NC2"],
  },
  obsidian: {
    id: "obsidian",
    category: "minerals",
    foundOn: ["BT3", "NC1"],
  },
  platinum: {
    id: "platinum",
    category: "minerals",
    foundOn: ["MM1", "TW4", "BT1", "CV2"],
  },
  rutile: {
    id: "rutile",
    category: "minerals",
    foundOn: ["CC3", "CV1"],
  },
  salt: {
    id: "salt",
    category: "minerals",
    foundOn: ["MM3", "TW3", "BT1", "NC3"],
  },
  silver: {
    id: "silver",
    category: "minerals",
    foundOn: ["CC4", "MM4", "TW1", "BT2", "CV1"],
  },
  sulfur: {
    id: "sulfur",
    category: "minerals",
    foundOn: ["NC3"],
  },

  // Gems (Flawless)
  aquamarine: {
    id: "aquamarine",
    category: "gems",
    foundOn: ["CV3"],
  },
  citrine: {
    id: "citrine",
    category: "gems",
    foundOn: ["TW4", "BT3"],
  },
  emerald: {
    id: "emerald",
    category: "gems",
    foundOn: ["CV3"],
  },
  opal: {
    id: "opal",
    category: "gems",
    foundOn: ["TW2", "BT1"],
  },
  ruby: {
    id: "ruby",
    category: "gems",
    foundOn: ["TW3", "CV1"],
  },
  sapphire: {
    id: "sapphire",
    category: "gems",
    foundOn: ["MM2", "MM3", "CV3"],
  },
  topaz: {
    id: "topaz",
    category: "gems",
    foundOn: ["TW1"],
  },

  // Gems (Cracked)
  "cracked-aquamarine": {
    id: "cracked-aquamarine",
    category: "gems",
    foundOn: ["CV3"],
  },
  "cracked-citrine": {
    id: "cracked-citrine",
    category: "gems",
    foundOn: ["TW4", "BT3"],
  },
  "cracked-emerald": {
    id: "cracked-emerald",
    category: "gems",
    foundOn: ["CV3"],
  },
  "cracked-opal": {
    id: "cracked-opal",
    category: "gems",
    foundOn: ["TW2", "BT1"],
  },
  "cracked-ruby": {
    id: "cracked-ruby",
    category: "gems",
    foundOn: ["TW3", "CV1"],
  },
  "cracked-sapphire": {
    id: "cracked-sapphire",
    category: "gems",
    foundOn: ["MM2", "MM3", "CV3"],
  },
  "cracked-topaz": {
    id: "cracked-topaz",
    category: "gems",
    foundOn: ["TW1"],
  },

  // Liquids
  acid: {
    id: "acid",
    category: "liquids",
    foundOn: ["BT3", "NC3"],
  },
  brine: {
    id: "brine",
    category: "liquids",
    foundOn: ["CC4", "BT1", "NC3"],
  },
  mercury: {
    id: "mercury",
    category: "liquids",
    foundOn: ["BT2"],
  },
  nitrogen: {
    id: "nitrogen",
    category: "liquids",
    foundOn: ["TW2", "CV4"],
  },
  petroleum: {
    id: "petroleum",
    category: "liquids",
    foundOn: ["BT4", "NC4"],
  },
  water: {
    id: "water",
    category: "liquids",
    foundOn: ["CC4", "CV3"],
  },

  // Gases
  "argon-gas": {
    id: "argon-gas",
    category: "gases",
    foundOn: ["MM2", "CV1", "argon-gas-nebula"],
  },
  "chlorine-gas": {
    id: "chlorine-gas",
    category: "gases",
    foundOn: ["CV3", "NC3", "chlorine-gas-nebula"],
  },
  "helium-gas": {
    id: "helium-gas",
    category: "gases",
    foundOn: ["NC1", "helium-gas-nebula"],
  },
  "hydrogen-gas": {
    id: "hydrogen-gas",
    category: "gases",
    foundOn: ["NC3", "hydrogen-gas-nebula"],
  },
  "neon-gas": {
    id: "neon-gas",
    category: "gases",
    foundOn: ["neon-gas-nebula"],
  },
  "nitrogen-gas": {
    id: "nitrogen-gas",
    category: "gases",
    foundOn: ["CC2", "MM2", "CV4", "NC2", "nitrogen-gas-nebula"],
  },
  "oxygen-gas": {
    id: "oxygen-gas",
    category: "gases",
    foundOn: ["CC3", "TW3", "TW4", "NC4", "oxygen-gas-nebula"],
  },

  // Data Resources - Composition
  "carbonite-asteroid-data": {
    id: "carbonite-asteroid-data",
    category: "data",
    foundOn: ["CC1", "CC3", "MM2", "TW1", "TW2", "BT4", "CV2", "NC1", "NC4"],
  },
  "metallic-asteroid-data": {
    id: "metallic-asteroid-data",
    category: "data",
    foundOn: ["CC4", "MM1", "MM3", "BT2", "CV4", "NC2"],
  },
  "silicate-asteroid-data": {
    id: "silicate-asteroid-data",
    category: "data",
    foundOn: ["CC2", "MM4", "TW3", "TW4", "BT1", "BT3", "CV1", "CV3", "NC3"],
  },

  // Data Resources - Phenomenon
  "creature-data": {
    id: "creature-data",
    category: "data",
    foundOn: ["CV3"],
  },
  "electrical-storm-data": {
    id: "electrical-storm-data",
    category: "data",
    foundOn: ["CV4"],
  },
  "low-gravity-data": {
    id: "low-gravity-data",
    category: "data",
    foundOn: ["CV1"],
  },
  "meteorite-data": {
    id: "meteorite-data",
    category: "data",
    foundOn: ["CV2"],
  },
};

export function isRawMaterial(itemId: string): boolean {
  return itemId in rawMaterials;
}
