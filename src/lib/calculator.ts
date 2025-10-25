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

function generateCombinations<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map((item) => [item]);

  const [first, ...rest] = arrays;
  const restCombinations = generateCombinations(rest);

  const result: T[][] = [];
  for (const item of first) {
    for (const combination of restCombinations) {
      result.push([item, ...combination]);
    }
  }
  return result;
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

    // 各入力材料について再帰的に計算
    // 原材料でも製造レシピがある場合は、両方のパターンを生成する必要がある
    const inputPatterns: CalculationResult[][] = [];

    for (const input of method.inputs) {
      const requiredAmount = input.amount * timesNeeded;
      const patterns: CalculationResult[] = [];

      const isRaw = isRawMaterial(input.item);

      // 製造可能かチェック
      const subResults = calculateManufacturing(
        input.item,
        requiredAmount,
        new Set([...visited, itemId]),
      );

      // 原材料でない場合は、製造レシピが必須
      if (!isRaw) {
        if (subResults && subResults.length > 0) {
          patterns.push(...subResults);
        }
        // 製造レシピがない非原材料の場合、patternsが空になる
        // この場合、このレシピ全体をスキップする必要がある
      } else {
        // 原材料の場合：製造レシピがあれば両方のパターンを追加
        if (subResults && subResults.length > 0) {
          patterns.push(...subResults);
        }
        // 直接採取するパターンも追加
        patterns.push({
          totalDuration: 0,
          totalItems: [{ item: input.item, amount: requiredAmount }],
          recipes: [],
        });
      }

      // パターンが空の場合、このレシピ全体をスキップ
      if (patterns.length === 0) {
        inputPatterns.push([]);
      } else {
        inputPatterns.push(patterns);
      }
    }

    // いずれかの入力材料のパターンが空の場合、このレシピはスキップ
    if (inputPatterns.some((patterns) => patterns.length === 0)) {
      continue;
    }

    // すべての入力材料のパターンの組み合わせを生成
    const combinations = generateCombinations(inputPatterns);

    for (const combination of combinations) {
      let combinedDuration = method.duration * timesNeeded;
      const combinedRecipes: CalculationRecipe[] = [currentRecipe];
      const combinedRawMaterials: ItemStack[] = [];

      for (const pattern of combination) {
        combinedDuration += pattern.totalDuration;
        combinedRecipes.push(...pattern.recipes);
        combinedRawMaterials.push(...pattern.totalItems);
      }

      results.push({
        totalDuration: combinedDuration,
        totalItems: mergeItemStacks(combinedRawMaterials),
        recipes: combinedRecipes,
      });
    }
  }

  return results.length > 0 ? results.sort((a, b) => a.totalDuration - b.totalDuration) : null;
}
