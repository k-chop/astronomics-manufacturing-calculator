import type { Locale, LocalizedNames } from "./item-names";
import type { ItemStack } from "./recipes";

/**
 * 納品契約を出す駅（Cube Corp は納品契約がないので含めない）
 */
export type Station = "medusa-minerals" | "tw-gems" | "black-tidal" | "ceres-vesta" | "noblecore-ag";

export const stationNames: { [station in Station]: LocalizedNames } = {
  "medusa-minerals": { en: "Medusa Minerals" },
  "tw-gems": { en: "TW Gems" },
  "black-tidal": { en: "Black Tidal" },
  "ceres-vesta": { en: "Ceres Vesta" },
  "noblecore-ag": { en: "Noblecore AG" },
};

/**
 * 納品契約 1 件。ゲーム内では駅ごとに number の順で開示される
 */
export type Contract = {
  id: string; // `${station}-${number}`
  station: Station;
  number: number;
  name: LocalizedNames;
  requirement: ItemStack; // 納品物（1 種類）
  reward: number; // 報酬（Earth$）
  note?: string;
};

type ContractInput = { number: number; name: string; item: string; amount: number; reward: number; note?: string };

function stationContracts(station: Station, inputs: ContractInput[]): Contract[] {
  return inputs.map(({ number, name, item, amount, reward, note }) => ({
    id: `${station}-${number}`,
    station,
    number,
    name: { en: name },
    requirement: { item, amount },
    reward,
    ...(note === undefined ? {} : { note }),
  }));
}

// Source: https://astronomics.wiki.gg/wiki/Contracts
export const contracts: Contract[] = [
  ...stationContracts("medusa-minerals", [
    { number: 1, name: "Raw Cobalt Delivery", item: "cobalt", amount: 500, reward: 300 },
    { number: 2, name: "Raw Nickel Delivery", item: "nickel", amount: 1500, reward: 200 },
    { number: 3, name: "Raw Salt Delivery", item: "salt", amount: 1000, reward: 500 },
    { number: 4, name: "Raw Copper Delivery", item: "copper", amount: 2000, reward: 750 },
    { number: 5, name: "Raw Silver Delivery", item: "silver", amount: 1000, reward: 600 },
    { number: 6, name: "Raw Amazonite Delivery", item: "amazonite", amount: 1000, reward: 300 },
    { number: 7, name: "Raw Platinum Delivery", item: "platinum", amount: 500, reward: 300 },
    { number: 8, name: "Polymer Delivery", item: "polymers", amount: 500, reward: 500 },
    { number: 9, name: "Carbon Fiber Delivery", item: "carbon-fiber", amount: 1000, reward: 400 },
    { number: 10, name: "Steel Rod Delivery", item: "steel-rods", amount: 2000, reward: 1000 },
  ]),
  ...stationContracts("tw-gems", [
    {
      number: 1,
      name: "Cracked Ruby Delivery",
      item: "cracked-ruby",
      amount: 200,
      reward: 1000,
      note: "Accepts both cracked and flawless Ruby.",
    },
    { number: 2, name: "Flawless Sapphire Delivery", item: "sapphire", amount: 250, reward: 500 },
    { number: 3, name: "Flawless Opal Delivery", item: "opal", amount: 750, reward: 1200 },
    { number: 4, name: "Raw Galena Delivery", item: "galena", amount: 2000, reward: 500 },
    { number: 5, name: "Flawless Citrine Delivery", item: "citrine", amount: 600, reward: 600 },
    { number: 6, name: "Pirate Core", item: "pirate-core", amount: 10, reward: 500 },
    { number: 7, name: "Raw Magnesite Delivery", item: "magnesite", amount: 2000, reward: 500 },
    { number: 8, name: "Flawless Ruby Delivery", item: "ruby", amount: 600, reward: 750 },
    { number: 9, name: "Flawless Topaz Delivery", item: "topaz", amount: 600, reward: 1000 },
  ]),
  ...stationContracts("black-tidal", [
    { number: 1, name: "Plastics Delivery", item: "plastics", amount: 500, reward: 2000 },
    { number: 2, name: "Raw Bauxite Delivery", item: "bauxite", amount: 2000, reward: 1000 },
    { number: 3, name: "Raw Diamond Delivery", item: "diamond", amount: 2000, reward: 1000 },
    { number: 4, name: "Raw Lodestone Delivery", item: "lodestone", amount: 2000, reward: 1000 },
    { number: 5, name: "Brine Delivery", item: "brine", amount: 2000, reward: 2000 },
    { number: 6, name: "Mercury Delivery", item: "mercury", amount: 1000, reward: 2000 },
  ]),
  ...stationContracts("ceres-vesta", [
    { number: 1, name: "Asteroid Research", item: "asteroid-research", amount: 1000, reward: 2500 },
    { number: 2, name: "Conductivity Research", item: "conductivity-research", amount: 400, reward: 1500 },
    { number: 3, name: "Trajectory Research", item: "trajectory-research", amount: 500, reward: 2000 },
    { number: 4, name: "Buoyancy Research", item: "buoyancy-research", amount: 500, reward: 1500 },
    { number: 5, name: "Pirate Core", item: "pirate-core", amount: 40, reward: 1500 },
    { number: 6, name: "Panspermia Research", item: "panspermia-research", amount: 500, reward: 5000 },
    {
      number: 7,
      name: "Nitrogen Delivery",
      item: "nitrogen",
      amount: 1000,
      reward: 2000,
      note: "Requires liquid Nitrogen, not Nitrogen Gas.",
    },
    { number: 8, name: "Petroleum Delivery", item: "petroleum", amount: 1000, reward: 750 },
  ]),
  ...stationContracts("noblecore-ag", [
    { number: 1, name: "Raw Obsidian Delivery", item: "obsidian", amount: 2000, reward: 1250 },
    { number: 2, name: "Raw Chromite Delivery", item: "chromite", amount: 5000, reward: 1000 },
    { number: 3, name: "Superconductor Coils Delivery", item: "superconductor-coils", amount: 600, reward: 1750 },
    { number: 4, name: "Magnetic Clamps Delivery", item: "magnetic-clamps", amount: 450, reward: 1750 },
    { number: 5, name: "Quantum Data Drives Delivery", item: "quantum-data-drives", amount: 250, reward: 2000 },
    { number: 6, name: "Holo Display Screens Delivery", item: "holo-display-screens", amount: 300, reward: 1500 },
    { number: 7, name: "Thermic Explosives Delivery", item: "thermic-explosives", amount: 500, reward: 2000 },
    { number: 8, name: "Neon Gas Delivery", item: "neon-gas", amount: 450, reward: 4000 },
  ]),
];

export function getContract(contractId: string): Contract | undefined {
  return contracts.find((contract) => contract.id === contractId);
}

export function getContractName(contractId: string, locale: Locale = "en"): string {
  const contract = getContract(contractId);
  if (!contract) return contractId;
  return contract.name[locale] || contract.name.en;
}

export function getStationName(station: Station, locale: Locale = "en"): string {
  return stationNames[station][locale] || stationNames[station].en;
}
