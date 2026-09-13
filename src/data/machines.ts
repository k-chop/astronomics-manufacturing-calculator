import type { Locale, LocalizedNames } from "./item-names";

/**
 * 製造機械の表示名（定義順がツリーなどでの表示順）
 */
export const machineNames: { [machineId: string]: LocalizedNames } = {
  carbonator: { en: "Carbonator" },
  clarifier: { en: "Clarifier" },
  converter: { en: "Converter" },
  crusher: { en: "Crusher" },
  constructor: { en: "Constructor" },
  computer: { en: "Computer (Research)" },
};

export function getMachineName(machineId: string, locale: Locale = "en"): string {
  const names = machineNames[machineId];
  if (!names) return machineId;
  return names[locale] || names.en;
}
