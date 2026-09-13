import type { Inventory, ProductionPlan, ProductionPlanEntry } from "../types/production-plan";
import { emptyProductionPlan } from "./production-plan-utils";

const STORAGE_KEY = "astronomics-production-plan";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * 保存済みデータを ProductionPlan として読む。形が違えば空の plan にする
 */
export function parseProductionPlan(raw: unknown): ProductionPlan {
  if (!isRecord(raw) || !Array.isArray(raw.items) || !isRecord(raw.inventory)) {
    return emptyProductionPlan;
  }
  return { items: raw.items as ProductionPlanEntry[], inventory: raw.inventory as Inventory };
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
    return parseProductionPlan(JSON.parse(stored));
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
