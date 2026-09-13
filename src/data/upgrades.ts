import type { Locale, LocalizedNames } from "./item-names";
import type { ItemStack } from "./recipes";

export type UpgradeCategory = "freighter" | "shuttle";

export type UpgradeLevel = {
  level: number;
  requirements: ItemStack[];
  credits: number;
};

export type Upgrade = {
  id: string;
  name: LocalizedNames;
  category: UpgradeCategory;
  levels: UpgradeLevel[];
};

export const upgradeCategoryNames: { [category in UpgradeCategory]: LocalizedNames } = {
  freighter: { en: "Freighter" },
  shuttle: { en: "Shuttle" },
};

export const upgrades: Upgrade[] = [
  // Freighter upgrades
  {
    id: "fuel-capacity",
    name: { en: "Fuel Capacity" },
    category: "freighter",
    levels: [
      {
        level: 1,
        requirements: [
          { item: "biomass", amount: 300 },
          { item: "carbon", amount: 500 },
        ],
        credits: 40,
      },
      {
        level: 2,
        requirements: [
          { item: "chromite", amount: 400 },
          { item: "fiber-optic-strands", amount: 300 },
        ],
        credits: 975,
      },
      {
        level: 3,
        requirements: [
          { item: "thermic-explosives", amount: 400 },
          { item: "superconductor-coils", amount: 150 },
        ],
        credits: 2950,
      },
    ],
  },
  {
    id: "manufacturing",
    name: { en: "Manufacturing" },
    category: "freighter",
    levels: [
      {
        level: 1,
        requirements: [
          { item: "cobalt", amount: 800 },
          { item: "iron", amount: 1000 },
        ],
        credits: 330,
      },
      {
        level: 2,
        requirements: [
          { item: "graphite", amount: 500 },
          { item: "lodestone", amount: 750 },
        ],
        credits: 1440,
      },
      {
        level: 3,
        requirements: [
          { item: "argon-gas", amount: 350 },
          { item: "hydrogen-gas", amount: 900 },
        ],
        credits: 2100,
      },
    ],
  },
  {
    id: "navigation-systems",
    name: { en: "Navigation Systems" },
    category: "freighter",
    levels: [
      {
        level: 1,
        requirements: [{ item: "rutile", amount: 500 }],
        credits: 175,
      },
      {
        level: 2,
        requirements: [
          { item: "resin", amount: 300 },
          { item: "steel-rods", amount: 400 },
        ],
        credits: 850,
      },
      {
        level: 3,
        requirements: [
          { item: "combustion-research", amount: 200 },
          { item: "trajectory-research", amount: 200 },
        ],
        credits: 1400,
      },
    ],
  },
  {
    id: "scanner-array",
    name: { en: "Scanner Array" },
    category: "freighter",
    levels: [
      {
        level: 1,
        requirements: [
          { item: "nickel", amount: 500 },
          { item: "silica", amount: 700 },
        ],
        credits: 135,
      },
      {
        level: 2,
        requirements: [
          { item: "magnesite", amount: 650 },
          { item: "silver", amount: 650 },
        ],
        credits: 900,
      },
      {
        level: 3,
        requirements: [
          { item: "magnetic-field-research", amount: 200 },
          { item: "optics-research", amount: 200 },
        ],
        credits: 1140,
      },
    ],
  },
  {
    id: "storage-capacity",
    name: { en: "Storage Capacity" },
    category: "freighter",
    levels: [
      {
        level: 1,
        requirements: [
          { item: "copper", amount: 700 },
          { item: "graphite", amount: 350 },
        ],
        credits: 367.5,
      },
      {
        level: 2,
        requirements: [{ item: "opal", amount: 250 }],
        credits: 950,
      },
      {
        level: 3,
        requirements: [
          { item: "brine", amount: 1000 },
          { item: "copper-wire", amount: 500 },
        ],
        credits: 1280,
      },
    ],
  },

  // Shuttle upgrades
  {
    id: "shuttle-equipment",
    name: { en: "Shuttle Equipment" },
    category: "shuttle",
    levels: [
      {
        level: 1,
        requirements: [{ item: "galena", amount: 600 }],
        credits: 210,
      },
      {
        level: 2,
        requirements: [
          { item: "carbon-fiber", amount: 300 },
          { item: "topaz", amount: 250 },
        ],
        credits: 950,
      },
      {
        level: 3,
        requirements: [
          { item: "acid", amount: 400 },
          { item: "mercury", amount: 400 },
        ],
        credits: 1620,
      },
      {
        level: 4,
        requirements: [
          { item: "asteroid-research", amount: 100 },
          { item: "buoyancy-research", amount: 200 },
        ],
        credits: 1850,
      },
      {
        level: 5,
        requirements: [
          { item: "oxygen-gas", amount: 650 },
          { item: "quantum-data-drives", amount: 20 },
        ],
        credits: 2100,
      },
    ],
  },
  {
    id: "shuttle-equipment-delivery",
    name: { en: "Shuttle Equipment Delivery" },
    category: "shuttle",
    levels: [
      {
        level: 1,
        requirements: [{ item: "fiber-optic-strands", amount: 400 }],
        credits: 1050,
      },
    ],
  },
  {
    id: "shuttle-forge",
    name: { en: "Shuttle Forge" },
    category: "shuttle",
    levels: [
      {
        level: 1,
        requirements: [{ item: "iron", amount: 300 }],
        credits: 15,
      },
      {
        level: 2,
        requirements: [
          { item: "gem-dust", amount: 1000 },
          { item: "sand", amount: 1000 },
        ],
        credits: 990,
      },
    ],
  },
  {
    id: "shuttle-storage",
    name: { en: "Shuttle Storage" },
    category: "shuttle",
    levels: [
      {
        level: 1,
        requirements: [{ item: "salt", amount: 250 }],
        credits: 400,
      },
      {
        level: 2,
        requirements: [{ item: "ruby", amount: 1000 }],
        credits: 1080,
      },
    ],
  },
];

export function getUpgrade(upgradeId: string): Upgrade | undefined {
  return upgrades.find((upgrade) => upgrade.id === upgradeId);
}

export function getUpgradeLevel(upgradeId: string, level: number): UpgradeLevel | undefined {
  return getUpgrade(upgradeId)?.levels.find((upgradeLevel) => upgradeLevel.level === level);
}

export function getUpgradeName(upgradeId: string, locale: Locale = "en"): string {
  const upgrade = getUpgrade(upgradeId);
  if (!upgrade) return upgradeId;
  return upgrade.name[locale] || upgrade.name.en;
}

export function getUpgradeCategoryName(category: UpgradeCategory, locale: Locale = "en"): string {
  return upgradeCategoryNames[category][locale] || upgradeCategoryNames[category].en;
}
