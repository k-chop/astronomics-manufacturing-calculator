import type { ItemStack } from "../data/recipes";
import type {
  MaterialProgress,
  ProductionPlan,
  ProductionPlanItem,
} from "../types/production-plan";
import type { CalculationResult } from "./calculator";

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 生産計画にアイテムを追加
 */
export function addItemToPlan(
  plan: ProductionPlan,
  itemId: string,
  amount: number,
  calculationResults: CalculationResult[],
): ProductionPlan {
  // 初期状態：最速パターン（results[0]）を選択
  const selectedResult = calculationResults[0];

  // 原材料の進捗を初期化
  const materialProgress: MaterialProgress = {};
  for (const material of selectedResult.totalItems) {
    materialProgress[material.item] = {
      required: material.amount,
      collected: 0,
    };
  }

  const newItem: ProductionPlanItem = {
    id: generateId(),
    itemId,
    amount,
    selectedPatternIndex: 0,
    completed: false,
    calculationResults,
    materialProgress,
  };

  return {
    items: [...plan.items, newItem],
  };
}

/**
 * 生産計画からアイテムを削除
 */
export function removeItemFromPlan(
  plan: ProductionPlan,
  itemId: string,
): ProductionPlan {
  return {
    items: plan.items.filter((item) => item.id !== itemId),
  };
}

/**
 * アイテムの完了状態を切り替え
 */
export function toggleItemCompletion(
  plan: ProductionPlan,
  itemId: string,
): ProductionPlan {
  return {
    items: plan.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    ),
  };
}

/**
 * 原材料の収集数を更新
 */
export function updateMaterialProgress(
  plan: ProductionPlan,
  itemId: string,
  materialId: string,
  collected: number,
): ProductionPlan {
  return {
    items: plan.items.map((item) => {
      if (item.id !== itemId) return item;

      return {
        ...item,
        materialProgress: {
          ...item.materialProgress,
          [materialId]: {
            ...item.materialProgress[materialId],
            collected: Math.max(
              0,
              Math.min(collected, item.materialProgress[materialId].required),
            ),
          },
        },
      };
    }),
  };
}

/**
 * 全アイテムの原材料を集計（完了済みを除く）
 */
export function aggregateMaterials(plan: ProductionPlan): ItemStack[] {
  const materialMap = new Map<string, number>();

  for (const item of plan.items) {
    if (item.completed) continue;

    const selectedResult = item.calculationResults[item.selectedPatternIndex];
    for (const material of selectedResult.totalItems) {
      const progress = item.materialProgress[material.item];
      const remaining = progress.required - progress.collected;

      if (remaining > 0) {
        const current = materialMap.get(material.item) || 0;
        materialMap.set(material.item, current + remaining);
      }
    }
  }

  return Array.from(materialMap.entries()).map(([item, amount]) => ({
    item,
    amount,
  }));
}
