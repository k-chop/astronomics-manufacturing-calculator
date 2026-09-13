import { isRawMaterial } from "../data/raw-materials";
import type { ItemStack } from "../data/recipes";
import { getUpgradeLevel } from "../data/upgrades";
import type {
  Inventory,
  ProductionPlan,
  ProductionPlanEntry,
  ProductionPlanItem,
  ProductionPlanUpgrade,
  UpgradeRequirement,
} from "../types/production-plan";
import type { CalculationRecipe, CalculationResult } from "./calculator";
import { calculateManufacturing, mergeItemStacks } from "./calculator";

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  return crypto.randomUUID();
}

export const emptyProductionPlan: ProductionPlan = { items: [], inventory: {} };

/**
 * エントリが必要とする原材料の一覧を返す（進捗を考慮しない、追加時点の全量）
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

/**
 * エントリの製造ステップ一覧（stepProgress と同じ順）
 * item: 選択中パターンのレシピ
 * upgrade: 各要求資源の最速パターンのレシピを連結したもの
 */
export function getEntrySteps(entry: ProductionPlanEntry): CalculationRecipe[] {
  if (entry.kind === "item") {
    return entry.calculationResults[entry.selectedPatternIndex].recipes;
  }
  return entry.requirements.flatMap((requirement) => requirement.calculationResults?.[0].recipes ?? []);
}

function getStepDone(entry: ProductionPlanEntry, stepIndex: number): number {
  return entry.stepProgress[stepIndex] ?? 0;
}

function addAmount(map: Map<string, number>, item: string, amount: number): void {
  map.set(item, (map.get(item) ?? 0) + amount);
}

export type MaterialStatus = {
  item: string;
  need: number; // このエントリが在庫から必要とする数（在庫と実行済み分を差し引いた、実際に要る分）
  have: number; // 在庫
  shortage: number; // 不足（在庫でも残りの製造でも賄えない分）
};

export type StepStatus = {
  recipe: CalculationRecipe;
  done: number; // 実行済み回数
  remaining: number; // count − done
  usefulRuns: number; // 在庫と実行済み分を考慮して、まだ実行する意味がある回数
  craftableNow: number; // 今の在庫で実行でき、かつ意味がある回数
};

export type EntryAnalysis = {
  steps: StepStatus[];
  materials: MaterialStatus[];
};

/**
 * 今の在庫でこのステップをあと何回実行できるか（残り回数を上限とする）
 */
export function getCraftableRuns(recipe: CalculationRecipe, done: number, inventory: Inventory): number {
  const remaining = Math.max(0, recipe.count - done);
  if (remaining === 0) return 0;
  const byInputs = recipe.inputs.map((input) => Math.floor((inventory[input.item] ?? 0) / input.amount));
  return Math.max(0, Math.min(remaining, ...byInputs));
}

/**
 * エントリのステップと材料を在庫に基づいて分析する（他プランとは独立に在庫全体と比較）
 *
 * ステップは「親 → 子」の順に並んでいるので、その順に処理する:
 * - 親ステップの残り回数から入力の需要を積み、子ステップは「需要 − 在庫 − 既に積んだ生産」を埋めるのに必要な回数だけ実行する
 * - 在庫に中間材料があれば子ステップは不要（usefulRuns = 0）になり、その原材料も要求しない
 * - 材料一覧には、このエントリ内に作るステップがないもの（原材料）と、作っても足りないものだけを出す
 */
export function analyzeEntry(entry: ProductionPlanEntry, inventory: Inventory): EntryAnalysis {
  const recipes = getEntrySteps(entry);
  const demand = new Map<string, number>();
  const produced = new Map<string, number>();
  const producedItems = new Set(recipes.flatMap((recipe) => recipe.outputs.map((output) => output.item)));

  if (entry.kind === "upgrade") {
    for (const requirement of entry.requirements) addAmount(demand, requirement.item, requirement.amount);
  }

  const steps = recipes.map((recipe, index): StepStatus => {
    const done = getStepDone(entry, index);
    const remaining = Math.max(0, recipe.count - done);

    let usefulRuns = remaining;
    const isRoot = entry.kind === "item" && index === 0;
    if (!isRoot) {
      const output = recipe.outputs[0];
      const gap = Math.max(
        0,
        (demand.get(output.item) ?? 0) - (inventory[output.item] ?? 0) - (produced.get(output.item) ?? 0),
      );
      usefulRuns = Math.min(remaining, Math.ceil(gap / output.amount));
    }

    for (const output of recipe.outputs) addAmount(produced, output.item, output.amount * usefulRuns);
    for (const input of recipe.inputs) addAmount(demand, input.item, input.amount * usefulRuns);

    return {
      recipe,
      done,
      remaining,
      usefulRuns,
      craftableNow: Math.min(usefulRuns, getCraftableRuns(recipe, done, inventory)),
    };
  });

  const materials: MaterialStatus[] = [];
  for (const [item, need] of demand) {
    if (need === 0) continue;
    const have = inventory[item] ?? 0;
    const shortage = Math.max(0, need - have - (produced.get(item) ?? 0));
    if (!producedItems.has(item) || shortage > 0) {
      materials.push({ item, need, have, shortage });
    }
  }

  return { steps, materials };
}

/**
 * エントリの残り必要材料を在庫と（他プランとは独立に）比較する
 */
export function getMaterialStatus(entry: ProductionPlanEntry, inventory: Inventory): MaterialStatus[] {
  return analyzeEntry(entry, inventory).materials;
}

export function isMaterialsCovered(statuses: MaterialStatus[]): boolean {
  return statuses.every((status) => status.shortage === 0);
}

/**
 * 「あとは仕上げるだけ」か: 今の在庫だけでエントリの最終成果を得られる
 * - upgrade: 要求資源がすべて在庫にある（アップグレードを実行できる）
 * - item: 最終レシピ（先頭ステップ）の残り回数をすべて今の在庫で実行できる
 */
export function isReadyToFinish(entry: ProductionPlanEntry, inventory: Inventory): boolean {
  if (entry.completed) return false;
  if (entry.kind === "upgrade") {
    return entry.requirements.every((requirement) => (inventory[requirement.item] ?? 0) >= requirement.amount);
  }
  const root = analyzeEntry(entry, inventory).steps[0];
  return root !== undefined && root.remaining > 0 && root.craftableNow === root.remaining;
}

function adjustInventory(inventory: Inventory, item: string, delta: number): Inventory {
  const next = Math.max(0, (inventory[item] ?? 0) + delta);
  const result = { ...inventory };
  if (next === 0) {
    delete result[item];
  } else {
    result[item] = next;
  }
  return result;
}

/**
 * 在庫を手入力で設定する（0 以下は削除）
 */
export function setInventory(plan: ProductionPlan, itemId: string, amount: number): ProductionPlan {
  const inventory = { ...plan.inventory };
  if (amount > 0) {
    inventory[itemId] = amount;
  } else {
    delete inventory[itemId];
  }
  return { ...plan, inventory };
}

/**
 * ステップの実行回数を delta だけ増減し、在庫を自動で更新する
 * 増やすと入力を減らし出力を増やす。減らすと逆操作。在庫は 0 未満にならない
 * item エントリは最終成果物のステップが完了すると completed になる（減らして未完了に戻すと解除）
 */
export function recordStepRuns(
  plan: ProductionPlan,
  entryId: string,
  stepIndex: number,
  delta: number,
): ProductionPlan {
  const entry = plan.items.find((item) => item.id === entryId);
  if (!entry) return plan;
  const steps = getEntrySteps(entry);
  const recipe = steps[stepIndex];
  if (!recipe) return plan;

  const done = getStepDone(entry, stepIndex);
  const nextDone = Math.max(0, Math.min(recipe.count, done + delta));
  const actualDelta = nextDone - done;
  if (actualDelta === 0) return plan;

  let inventory = plan.inventory;
  for (const input of recipe.inputs) {
    inventory = adjustInventory(inventory, input.item, -input.amount * actualDelta);
  }
  for (const output of recipe.outputs) {
    inventory = adjustInventory(inventory, output.item, output.amount * actualDelta);
  }

  const stepProgress = steps.map((_, index) => (index === stepIndex ? nextDone : getStepDone(entry, index)));
  // item は最終成果物のステップ（先頭）が完了したら完了。在庫で賄えて実行不要になった子ステップは残っていてよい
  const completed = entry.kind === "item" ? stepProgress[0] >= steps[0].count : entry.completed;

  return {
    inventory,
    items: plan.items.map((item) => (item.id === entryId ? { ...item, stepProgress, completed } : item)),
  };
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

  const newItem: ProductionPlanItem = {
    kind: "item",
    id: generateId(),
    itemId,
    amount,
    selectedPatternIndex: patternIndex,
    completed: false,
    calculationResults,
    stepProgress: calculationResults[patternIndex].recipes.map(() => 0),
  };

  return { ...plan, items: [...plan.items, newItem] };
}

/**
 * 生産計画にアップグレードを追加
 * 存在しないアップグレード/レベルの場合は plan をそのまま返す
 */
export function addUpgradeToPlan(plan: ProductionPlan, upgradeId: string, level: number): ProductionPlan {
  const upgradeLevel = getUpgradeLevel(upgradeId, level);
  if (!upgradeLevel) return plan;

  const newEntry: ProductionPlanUpgrade = {
    kind: "upgrade",
    id: generateId(),
    upgradeId,
    level,
    completed: false,
    requirements: resolveUpgradeRequirements(upgradeLevel.requirements),
    stepProgress: [],
  };
  newEntry.stepProgress = getEntrySteps(newEntry).map(() => 0);

  return { ...plan, items: [...plan.items, newEntry] };
}

/**
 * 生産計画からエントリを削除
 */
export function removeItemFromPlan(plan: ProductionPlan, entryId: string): ProductionPlan {
  return { ...plan, items: plan.items.filter((item) => item.id !== entryId) };
}

/**
 * エントリの完了状態を切り替え
 * upgrade を完了にすると要求資源を在庫から消費し、未完了に戻すと戻す
 */
export function toggleItemCompletion(plan: ProductionPlan, entryId: string): ProductionPlan {
  const entry = plan.items.find((item) => item.id === entryId);
  if (!entry) return plan;
  const completed = !entry.completed;

  let inventory = plan.inventory;
  if (entry.kind === "upgrade") {
    const sign = completed ? -1 : 1;
    for (const requirement of entry.requirements) {
      inventory = adjustInventory(inventory, requirement.item, sign * requirement.amount);
    }
  }

  return {
    inventory,
    items: plan.items.map((item) => (item.id === entryId ? { ...item, completed } : item)),
  };
}

/**
 * 未完了エントリの残り必要材料を合算する
 */
export function aggregateRequired(plan: ProductionPlan): ItemStack[] {
  return mergeItemStacks(
    plan.items
      .filter((entry) => !entry.completed)
      .flatMap((entry) => getMaterialStatus(entry, plan.inventory).map(({ item, need }) => ({ item, amount: need }))),
  );
}

export type InventoryRow = {
  item: string;
  required: number;
  have: number;
  missing: number;
};

/**
 * 在庫パネルの行: 未完了エントリが必要とする材料だけ（必要数の降順）
 * どのプランも使わない材料は在庫に残っていても表示しない
 */
export function getInventoryRows(plan: ProductionPlan): InventoryRow[] {
  return aggregateRequired(plan)
    .map(({ item, amount }) => {
      const have = plan.inventory[item] ?? 0;
      return { item, required: amount, have, missing: Math.max(0, amount - have) };
    })
    .toSorted((a, b) => b.required - a.required);
}

export type ReadyCraft = {
  entry: ProductionPlanEntry;
  stepIndex: number;
  recipe: CalculationRecipe;
  runs: number;
};

/**
 * 今の在庫で実行できる製造ステップを、入力アイテムごとにまとめる（在庫パネルの表示用）
 */
export function getReadyCraftsByInput(plan: ProductionPlan): Map<string, ReadyCraft[]> {
  const byInput = new Map<string, ReadyCraft[]>();
  for (const craft of getReadyCrafts(plan)) {
    for (const input of craft.recipe.inputs) {
      byInput.set(input.item, [...(byInput.get(input.item) ?? []), craft]);
    }
  }
  return byInput;
}

/**
 * 今の在庫で実行できる製造ステップ（未完了エントリのみ）
 */
export function getReadyCrafts(plan: ProductionPlan): ReadyCraft[] {
  return plan.items
    .filter((entry) => !entry.completed)
    .flatMap((entry) =>
      analyzeEntry(entry, plan.inventory).steps.flatMap((step, stepIndex) =>
        step.craftableNow > 0 ? [{ entry, stepIndex, recipe: step.recipe, runs: step.craftableNow }] : [],
      ),
    );
}
