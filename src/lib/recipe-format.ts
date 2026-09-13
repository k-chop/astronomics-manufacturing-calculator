import { getItemName, type Locale } from "../data/item-names";
import { getMachineName } from "../data/machines";
import type { ItemStack } from "../data/recipes";
import { formatNumber } from "./format-utils";

/**
 * アイテムと数量の並びの表記（"Biomass ×50 + Water ×10"）
 */
export function formatItemStacks(stacks: ItemStack[], locale: Locale = "en", separator = " + "): string {
  return stacks.map((stack) => `${getItemName(stack.item, locale)} ×${formatNumber(stack.amount)}`).join(separator);
}

type RecipeLike = {
  machine: string;
  inputs: ItemStack[];
  outputs: ItemStack[];
};

/**
 * レシピ1回分の表記（"Carbonator: Biomass ×50 → Carbon ×10"）
 */
export function formatRecipe(recipe: RecipeLike, locale: Locale = "en"): string {
  return `${getMachineName(recipe.machine, locale)}: ${formatItemStacks(recipe.inputs, locale)} → ${formatItemStacks(recipe.outputs, locale)}`;
}
