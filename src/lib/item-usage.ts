import { getAliasItems } from "../data/aliases";
import { type RecipeMethod, recipes } from "../data/recipes";
import { upgrades } from "../data/upgrades";

/**
 * アイテムを入力に使うレシピ
 * viaAlias: エイリアス（Any Gem など）経由で使われる場合、そのエイリアス id
 */
export type RecipeUsage = {
  outputItem: string;
  method: RecipeMethod;
  viaAlias: string | null;
};

/**
 * アイテムを直接要求するアップグレード
 */
export type UpgradeUsage = {
  upgradeId: string;
  level: number;
  amount: number;
};

/**
 * 指定アイテムを入力に使うレシピを返す（エイリアス経由を含む）
 */
export function findRecipesUsingItem(itemId: string): RecipeUsage[] {
  const usages: RecipeUsage[] = [];

  for (const [outputItem, methods] of Object.entries(recipes)) {
    for (const method of methods) {
      for (const input of method.inputs) {
        if (input.item === itemId) {
          usages.push({ outputItem, method, viaAlias: null });
          break;
        }
        if (getAliasItems(input.item)?.includes(itemId)) {
          usages.push({ outputItem, method, viaAlias: input.item });
          break;
        }
      }
    }
  }

  return usages;
}

/**
 * 指定アイテムを直接要求するアップグレードを返す
 */
export function findUpgradesRequiringItem(itemId: string): UpgradeUsage[] {
  const usages: UpgradeUsage[] = [];

  for (const upgrade of upgrades) {
    for (const upgradeLevel of upgrade.levels) {
      const requirement = upgradeLevel.requirements.find((r) => r.item === itemId);
      if (requirement) {
        usages.push({ upgradeId: upgrade.id, level: upgradeLevel.level, amount: requirement.amount });
      }
    }
  }

  return usages;
}
