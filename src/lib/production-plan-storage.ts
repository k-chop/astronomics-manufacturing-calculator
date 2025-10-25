import type { ProductionPlan } from "../types/production-plan";

const STORAGE_KEY = "astronomics-production-plan";

/**
 * localStorageから生産計画を読み込む
 */
export function loadProductionPlan(): ProductionPlan {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { items: [] };
    }
    return JSON.parse(stored) as ProductionPlan;
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
