import type { ProductionPlan, ProductionPlanEntry } from "../types/production-plan";

const STORAGE_KEY = "astronomics-production-plan";

/**
 * 保存済みデータを現在の形式に変換する
 * kind が付く前に保存されたエントリはすべてアイテムなので kind: "item" を付与する
 */
export function migrateProductionPlan(raw: unknown): ProductionPlan {
  if (typeof raw !== "object" || raw === null || !("items" in raw) || !Array.isArray(raw.items)) {
    return { items: [] };
  }
  const items = raw.items.map((entry: ProductionPlanEntry | Omit<ProductionPlanEntry, "kind">) =>
    "kind" in entry ? entry : ({ kind: "item", ...entry } as ProductionPlanEntry),
  );
  return { items };
}

/**
 * localStorageから生産計画を読み込む
 */
export function loadProductionPlan(): ProductionPlan {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { items: [] };
    }
    return migrateProductionPlan(JSON.parse(stored));
  } catch (error) {
    console.error("Failed to load production plan:", error);
    return { items: [] };
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
