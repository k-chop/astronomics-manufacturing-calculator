import type { CalculationResult } from "../lib/calculator";

/**
 * 今持っている材料（プラン横断の在庫）
 * 原材料だけでなく、途中まで作った中間材料も含む
 */
export type Inventory = {
  [itemId: string]: number;
};

type ProductionPlanEntryBase = {
  id: string; // ユニークID
  completed: boolean; // 完了フラグ
  stepProgress: number[]; // getEntrySteps(entry) の順で、各製造ステップの実行済み回数
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
  inventory: Inventory;
};
