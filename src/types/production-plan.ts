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

/**
 * 生産計画の1アイテム
 */
export type ProductionPlanItem = {
  id: string; // ユニークID (timestamp + random)
  itemId: string; // アイテムID
  amount: number; // 作成する数
  selectedPatternIndex: number; // 選択されたパターン（results配列のインデックス）
  completed: boolean; // 製造完了フラグ
  calculationResults: CalculationResult[]; // 全パターンの計算結果
  materialProgress: MaterialProgress; // 原材料の収集進捗
};

/**
 * 生産計画全体
 */
export type ProductionPlan = {
  items: ProductionPlanItem[];
};
