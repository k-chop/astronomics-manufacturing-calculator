import { recipes } from "../data/recipes";

/**
 * Get the minimum production amount for an item.
 * If the item has multiple recipes, returns the maximum amount among them.
 * Returns 1 if the item has no recipes.
 */
export function getMinimumAmount(itemId: string): number {
  const recipeMethods = recipes[itemId];
  if (!recipeMethods || recipeMethods.length === 0) {
    return 1;
  }

  return Math.max(...recipeMethods.map((method) => method.amount));
}
