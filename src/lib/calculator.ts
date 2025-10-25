import { isRawMaterial } from "../data/raw-materials";
import type { ItemStack } from "../data/recipes";
import { recipes } from "../data/recipes";

export type CalculationRecipe = {
  machine: string;
  inputs: ItemStack[];
  outputs: ItemStack[];
  duration: number;
};

export type CalculationResult = {
  totalDuration: number;
  totalItems: ItemStack[];
  recipes: CalculationRecipe[];
};

function mergeItemStacks(stacks: ItemStack[]): ItemStack[] {
  const map = new Map<string, number>();
  for (const stack of stacks) {
    const current = map.get(stack.item) ?? 0;
    map.set(stack.item, current + stack.amount);
  }
  return Array.from(map.entries()).map(([item, amount]) => ({
    item,
    amount,
  }));
}

export function calculateManufacturing(
  itemId: string,
  amount: number,
  visited: Set<string> = new Set(),
): CalculationResult[] | null {
  // レシピが存在しない場合
  const methods = recipes[itemId];
  if (!methods || methods.length === 0) {
    return null;
  }

  const results: CalculationResult[] = [];

  for (const method of methods) {
    // 循環参照チェック: 自分自身を材料に含む場合はスキップ
    const hasCircularDependency = method.inputs.some(
      (input) => input.item === itemId,
    );
    if (hasCircularDependency) {
      continue;
    }

    // 必要な製造回数を計算
    const timesNeeded = Math.ceil(amount / method.amount);
    const totalOutputAmount = timesNeeded * method.amount;

    // この製造レシピの情報
    const currentRecipe: CalculationRecipe = {
      machine: method.machine,
      inputs: method.inputs.map((input) => ({
        item: input.item,
        amount: input.amount * timesNeeded,
      })),
      outputs: [{ item: itemId, amount: totalOutputAmount }],
      duration: method.duration,
    };

    let totalDuration = method.duration * timesNeeded;
    const allRecipes: CalculationRecipe[] = [currentRecipe];
    const allRawMaterials: ItemStack[] = [];

    // 各入力材料について再帰的に計算
    for (const input of method.inputs) {
      const requiredAmount = input.amount * timesNeeded;

      // 原材料の場合
      if (isRawMaterial(input.item)) {
        allRawMaterials.push({
          item: input.item,
          amount: requiredAmount,
        });
        continue;
      }

      // 製造可能なアイテムの場合、再帰呼び出し
      const subResults = calculateManufacturing(
        input.item,
        requiredAmount,
        new Set([...visited, itemId]),
      );

      // サブレシピが見つからない、または全て循環参照の場合
      if (!subResults || subResults.length === 0) {
        // このアイテムは製造できないが原材料でもない = データ不整合
        // とりあえず原材料として扱う
        allRawMaterials.push({
          item: input.item,
          amount: requiredAmount,
        });
        continue;
      }

      // 最初のサブレシピを選択
      const subResult = subResults[0];
      totalDuration += subResult.totalDuration;
      allRecipes.push(...subResult.recipes);
      allRawMaterials.push(...subResult.totalItems);
    }

    results.push({
      totalDuration,
      totalItems: mergeItemStacks(allRawMaterials),
      recipes: allRecipes,
    });
  }

  return results.length > 0 ? results : null;
}
