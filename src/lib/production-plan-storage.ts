import type { Inventory, ProductionPlan, ProductionPlanEntry } from "../types/production-plan";
import { emptyProductionPlan, getEntrySteps } from "./production-plan-utils";

const STORAGE_KEY = "astronomics-production-plan";

/**
 * 旧形式で保存されていた、プランごとの原材料収集進捗
 */
type LegacyMaterialProgress = {
  [itemId: string]: { required: number; collected: number };
};

type StoredEntry = Partial<ProductionPlanEntry> & {
  kind?: ProductionPlanEntry["kind"];
  materialProgress?: LegacyMaterialProgress;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * 保存済みデータを現在の形式に変換する
 * - kind がないエントリはアイテム（kind: "item"）
 * - inventory がなければ、各エントリの materialProgress.collected を合算して在庫にする
 * - stepProgress がなければ 0 埋めで初期化し、materialProgress は捨てる
 */
export function migrateProductionPlan(raw: unknown): ProductionPlan {
  if (!isRecord(raw) || !Array.isArray(raw.items)) {
    return emptyProductionPlan;
  }

  const inventory: Inventory = isRecord(raw.inventory) ? { ...(raw.inventory as Inventory) } : {};
  const hasInventory = isRecord(raw.inventory);

  const items = raw.items.map((stored: StoredEntry) => {
    const { materialProgress, ...rest } = stored;
    const withKind = { kind: "item", ...rest } as ProductionPlanEntry;

    if (!hasInventory && materialProgress) {
      for (const [item, progress] of Object.entries(materialProgress)) {
        if (progress.collected > 0) inventory[item] = (inventory[item] ?? 0) + progress.collected;
      }
    }

    const stepProgress = Array.isArray(withKind.stepProgress)
      ? withKind.stepProgress
      : getEntrySteps({ ...withKind, stepProgress: [] }).map(() => 0);

    return { ...withKind, stepProgress };
  });

  return { items, inventory };
}

/**
 * localStorageから生産計画を読み込む
 */
export function loadProductionPlan(): ProductionPlan {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return emptyProductionPlan;
    }
    return migrateProductionPlan(JSON.parse(stored));
  } catch (error) {
    console.error("Failed to load production plan:", error);
    return emptyProductionPlan;
  }
}

/**
 * localStorageに生産計画を保存
 */
export function saveProductionPlan(plan: ProductionPlan): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error("Failed to save production plan:", error);
  }
}

/**
 * 生産計画をクリア
 */
export function clearProductionPlan(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear production plan:", error);
  }
}
