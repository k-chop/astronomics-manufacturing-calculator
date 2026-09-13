import { getItemName, type Locale } from "../data/item-names";
import { getMachineName } from "../data/machines";
import { getUpgradeName } from "../data/upgrades";
import type { ProductionPlanEntry } from "../types/production-plan";
import type { CalculationRecipe } from "./calculator";
import { formatNumber } from "./format-utils";

/**
 * プランエントリの見出し（"20 × Graphite" / "Fuel Capacity Lv2"）
 */
export function getEntryTitle(entry: ProductionPlanEntry, locale: Locale = "en"): string {
  return entry.kind === "item"
    ? `${formatNumber(entry.amount)} × ${getItemName(entry.itemId, locale)}`
    : `${getUpgradeName(entry.upgradeId, locale)} Lv${entry.level}`;
}

export function formatItemStacks(
  stacks: CalculationRecipe["inputs"],
  locale: Locale = "en",
  separator = " + ",
): string {
  return stacks.map((stack) => `${getItemName(stack.item, locale)} ×${formatNumber(stack.amount)}`).join(separator);
}

/**
 * レシピ1回分の表記（"Carbonator: Biomass ×50 → Carbon ×10"）
 */
export function formatRecipe(recipe: CalculationRecipe, locale: Locale = "en"): string {
  return `${getMachineName(recipe.machine, locale)}: ${formatItemStacks(recipe.inputs, locale)} → ${formatItemStacks(recipe.outputs, locale)}`;
}
