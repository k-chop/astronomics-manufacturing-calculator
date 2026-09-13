import { isRawMaterial } from "../data/raw-materials";
import type { ItemStack } from "../data/recipes";
import { getUpgradeLevel } from "../data/upgrades";
import type {
  MaterialProgress,
  ProductionPlan,
  ProductionPlanEntry,
  ProductionPlanItem,
  ProductionPlanUpgrade,
  UpgradeRequirement,
} from "../types/production-plan";
import type { CalculationResult } from "./calculator";
import { calculateManufacturing, mergeItemStacks } from "./calculator";

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * エントリが必要とする原材料の一覧を返す
 * item: 選択中パターンの原材料
 * upgrade: 原材料の要求 + レシピ持ち要求を最速パターンで展開した原材料、を合算したもの
 */
export function getEntryMaterials(entry: ProductionPlanEntry): ItemStack[] {
  if (entry.kind === "item") {
    return entry.calculationResults[entry.selectedPatternIndex].totalItems;
  }
  return getUpgradeRequirementMaterials(entry.requirements);
}

/**
 * アップグレードの要求資源を原材料まで展開して合算する
 */
export function getUpgradeRequirementMaterials(requirements: UpgradeRequirement[]): ItemStack[] {
  return mergeItemStacks(
    requirements.flatMap((requirement) =>
      requirement.calculationResults === null
        ? [{ item: requirement.item, amount: requirement.amount }]
        : requirement.calculationResults[0].totalItems,
    ),
  );
}

/**
 * アップグレードの要求資源を計算結果付きに変換する
 * 原材料（Carbon や Biomass のようにレシピも持つものを含む）は直接採取するものとして展開しない
 */
export function resolveUpgradeRequirements(requirements: ItemStack[]): UpgradeRequirement[] {
  return requirements.map((requirement) => ({
    item: requirement.item,
    amount: requirement.amount,
    calculationResults: isRawMaterial(requirement.item)
      ? null
      : calculateManufacturing(requirement.item, requirement.amount),
  }));
}

function createMaterialProgress(materials: ItemStack[]): MaterialProgress {
  const materialProgress: MaterialProgress = {};
  for (const material of materials) {
    materialProgress[material.item] = {
      required: material.amount,
      collected: 0,
    };
  }
  return materialProgress;
}

/**
 * 生産計画にアイテムを追加
 * selectedPatternIndex で作るパターンを指定する（範囲外なら最速パターン = 0）
 */
export function addItemToPlan(
  plan: ProductionPlan,
  itemId: string,
  amount: number,
  calculationResults: CalculationResult[],
  selectedPatternIndex = 0,
): ProductionPlan {
  const patternIndex = selectedPatternIndex in calculationResults ? selectedPatternIndex : 0;
  const selectedResult = calculationResults[patternIndex];

  const newItem: ProductionPlanItem = {
    kind: "item",
    id: generateId(),
    itemId,
    amount,
    selectedPatternIndex: patternIndex,
    completed: false,
    calculationResults,
    materialProgress: createMaterialProgress(selectedResult.totalItems),
  };

  return {
    items: [...plan.items, newItem],
  };
}

/**
 * 生産計画にアップグレードを追加
 * 存在しないアップグレード/レベルの場合は plan をそのまま返す
 */
export function addUpgradeToPlan(plan: ProductionPlan, upgradeId: string, level: number): ProductionPlan {
  const upgradeLevel = getUpgradeLevel(upgradeId, level);
  if (!upgradeLevel) return plan;

  const requirements = resolveUpgradeRequirements(upgradeLevel.requirements);

  const newEntry: ProductionPlanUpgrade = {
    kind: "upgrade",
    id: generateId(),
    upgradeId,
    level,
    completed: false,
    requirements,
    materialProgress: createMaterialProgress(getUpgradeRequirementMaterials(requirements)),
  };

  return {
    items: [...plan.items, newEntry],
  };
}

/**
 * 生産計画からエントリを削除
 */
export function removeItemFromPlan(plan: ProductionPlan, entryId: string): ProductionPlan {
  return {
    items: plan.items.filter((item) => item.id !== entryId),
  };
}

/**
 * エントリの完了状態を切り替え
 */
export function toggleItemCompletion(plan: ProductionPlan, entryId: string): ProductionPlan {
  return {
    items: plan.items.map((item) => (item.id === entryId ? { ...item, completed: !item.completed } : item)),
  };
}

/**
 * 原材料の収集数を更新
 */
export function updateMaterialProgress(
  plan: ProductionPlan,
  entryId: string,
  materialId: string,
  collected: number,
): ProductionPlan {
  return {
    items: plan.items.map((item) => {
      if (item.id !== entryId) return item;

      return {
        ...item,
        materialProgress: {
          ...item.materialProgress,
          [materialId]: {
            ...item.materialProgress[materialId],
            collected: Math.max(0, Math.min(collected, item.materialProgress[materialId].required)),
          },
        },
      };
    }),
  };
}

/**
 * 全エントリの原材料を集計（完了済みを除く）
 */
export function aggregateMaterials(plan: ProductionPlan): ItemStack[] {
  const materialMap = new Map<string, number>();

  for (const entry of plan.items) {
    if (entry.completed) continue;

    for (const material of getEntryMaterials(entry)) {
      const progress = entry.materialProgress[material.item];
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
