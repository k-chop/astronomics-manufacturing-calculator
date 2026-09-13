import type { CalculationResult } from "../lib/calculator";

/**
 * 原材料の収集進捗
 */
export type MaterialProgress = {
  [itemId: string]: {
    required: number; // 必要な総数
    collected: number; // 収集済みの数
  };
};

type ProductionPlanEntryBase = {
  id: string; // ユニークID
  completed: boolean; // 完了フラグ
  materialProgress: MaterialProgress; // 原材料の収集進捗
};

/**
 * 生産計画の1アイテム（レシピ持ちアイテム × 個数）
 */
export type ProductionPlanItem = ProductionPlanEntryBase & {
  kind: "item";
  itemId: string; // アイテムID
  amount: number; // 作成する数
  selectedPatternIndex: number; // 選択されたパターン（results配列のインデックス）
  calculationResults: CalculationResult[]; // 全パターンの計算結果
};

/**
 * アップグレードの要求資源1件
 * calculationResults が null なら原材料（レシピなし）
 */
export type UpgradeRequirement = {
  item: string;
  amount: number;
  calculationResults: CalculationResult[] | null;
};

/**
 * 生産計画の1アップグレード（Freighter / Shuttle upgrade の1レベル）
 */
export type ProductionPlanUpgrade = ProductionPlanEntryBase & {
  kind: "upgrade";
  upgradeId: string;
  level: number;
  requirements: UpgradeRequirement[];
};

export type ProductionPlanEntry = ProductionPlanItem | ProductionPlanUpgrade;

/**
 * 生産計画全体
 */
export type ProductionPlan = {
  items: ProductionPlanEntry[];
};
