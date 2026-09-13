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
 * アップグレードの製造ステップ一覧: 各要求資源の最速パターンのレシピを連結したもの
 */
function getUpgradeSteps(requirements: UpgradeRequirement[]): CalculationRecipe[] {
  return requirements.flatMap((requirement) => requirement.calculationResults?.[0].recipes ?? []);
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
  return getUpgradeSteps(entry.requirements);
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

export type DemandStatus = MaterialStatus & {
  produced: number; // このエントリの残りステップで作る予定の数
};

export type EntryAnalysis = {
  steps: StepStatus[];
  demands: DemandStatus[]; // 要求されるものすべて（中間材料を含む）
  materials: MaterialStatus[]; // 在庫から用意する必要があるもの（原材料と、作っても足りないもの）
  readyToFinish: boolean; // 今の在庫だけで最終成果を得られる（あとは仕上げるだけ）
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
 * - demands には要求されるものすべてを出し、materials にはこのエントリ内に作るステップがないもの（原材料）と、作っても足りないものだけを出す
 * - readyToFinish は upgrade なら要求資源がすべて在庫にあること、item なら最終レシピ（先頭ステップ）の残りをすべて今の在庫で実行できること
 */
export function analyzeEntry(entry: ProductionPlanEntry, inventory: Inventory): EntryAnalysis {
  const recipes = getEntrySteps(entry);
  const demand = new Map<string, number>();
  const produced = new Map<string, number>();
  const producedItems = new Set(recipes.flatMap((recipe) => recipe.outputs.map((output) => output.item)));

  // 最終成果物も要求として扱う（在庫パネルに行を出し、最終ステップの実行をそこに付けるため）
  if (entry.kind === "upgrade") {
    for (const requirement of entry.requirements) addAmount(demand, requirement.item, requirement.amount);
  } else {
    addAmount(demand, entry.itemId, entry.amount);
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

  const demands: DemandStatus[] = [];
  for (const [item, need] of demand) {
    if (need === 0) continue;
    const have = inventory[item] ?? 0;
    const producedAmount = produced.get(item) ?? 0;
    const shortage = Math.max(0, need - have - producedAmount);
    demands.push({ item, need, have, shortage, produced: producedAmount });
  }
  const materials = demands
    .filter(({ item, shortage }) => !producedItems.has(item) || shortage > 0)
    .map(({ item, need, have, shortage }) => ({ item, need, have, shortage }));

  return { steps, demands, materials, readyToFinish: isReadyToFinish(entry, inventory, steps[0]) };
}

function isReadyToFinish(entry: ProductionPlanEntry, inventory: Inventory, root: StepStatus | undefined): boolean {
  if (entry.completed) return false;
  if (entry.kind === "upgrade") {
    return entry.requirements.every((requirement) => (inventory[requirement.item] ?? 0) >= requirement.amount);
  }
  return root !== undefined && root.remaining > 0 && root.craftableNow === root.remaining;
}

export function isMaterialsCovered(statuses: MaterialStatus[]): boolean {
  return statuses.every((status) => status.shortage === 0);
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

  const requirements = resolveUpgradeRequirements(upgradeLevel.requirements);
  const newEntry: ProductionPlanUpgrade = {
    kind: "upgrade",
    id: generateId(),
    upgradeId,
    level,
    completed: false,
    requirements,
    stepProgress: getUpgradeSteps(requirements).map(() => 0),
  };

  return { ...plan, items: [...plan.items, newEntry] };
}

/**
 * エントリを削除する。エントリが 1 つもなくなったら在庫も空にする
 * （ゲーム内と完全には同期できないので、残った在庫を次のプランに引きずらない）
 */
export function removeItemFromPlan(plan: ProductionPlan, entryId: string): ProductionPlan {
  const items = plan.items.filter((item) => item.id !== entryId);
  return { items, inventory: items.length === 0 ? {} : plan.inventory };
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

export type InventoryRow = {
  item: string;
  required: number;
  have: number;
  missing: number;
};

export type ReadyCraft = {
  entry: ProductionPlanEntry;
  stepIndex: number;
  recipe: CalculationRecipe;
  runs: number;
};

export type PlanAnalysis = {
  entries: Map<string, EntryAnalysis>; // エントリ id → 分析結果（完了済みも含む）
  rows: InventoryRow[]; // 在庫パネルの行
  crafts: ReadyCraft[]; // 今の在庫で実行できる製造ステップ（未完了エントリのみ）
  craftsByOutput: Map<string, ReadyCraft[]>; // crafts を出力アイテムごとにまとめたもの（在庫パネルの表示用）
};

type AnalyzedEntry = { entry: ProductionPlanEntry; analysis: EntryAnalysis };

/**
 * 在庫パネルの行: 未完了エントリが要求するもの（残りステップで作る中間材料も含む）を必要数の降順で
 * missing は各プランの残りステップで作れる分を差し引いた不足。どのプランも使わない材料は在庫に残っていても表示しない
 */
function buildInventoryRows(inventory: Inventory, pending: AnalyzedEntry[]): InventoryRow[] {
  const required = new Map<string, number>();
  const produced = new Map<string, number>();
  for (const { analysis } of pending) {
    for (const demandStatus of analysis.demands) {
      addAmount(required, demandStatus.item, demandStatus.need);
      addAmount(produced, demandStatus.item, demandStatus.produced);
    }
  }
  return [...required]
    .map(([item, amount]) => {
      const have = inventory[item] ?? 0;
      return { item, required: amount, have, missing: Math.max(0, amount - have - (produced.get(item) ?? 0)) };
    })
    .toSorted((a, b) => b.required - a.required);
}

function collectReadyCrafts(pending: AnalyzedEntry[]): ReadyCraft[] {
  return pending.flatMap(({ entry, analysis }) =>
    analysis.steps.flatMap((step, stepIndex) =>
      step.craftableNow > 0 ? [{ entry, stepIndex, recipe: step.recipe, runs: step.craftableNow }] : [],
    ),
  );
}

function groupCraftsByOutput(crafts: ReadyCraft[]): Map<string, ReadyCraft[]> {
  const byOutput = new Map<string, ReadyCraft[]>();
  for (const craft of crafts) {
    for (const output of craft.recipe.outputs) {
      byOutput.set(output.item, [...(byOutput.get(output.item) ?? []), craft]);
    }
  }
  return byOutput;
}

/**
 * プラン全体を在庫に基づいて分析する（各エントリの分析を 1 回だけ行い、そこから在庫行とクラフト提案を導く）
 */
export function analyzePlan(plan: ProductionPlan): PlanAnalysis {
  const analyzed = plan.items.map((entry): AnalyzedEntry => ({ entry, analysis: analyzeEntry(entry, plan.inventory) }));
  const pending = analyzed.filter(({ entry }) => !entry.completed);
  const crafts = collectReadyCrafts(pending);
  return {
    entries: new Map(analyzed.map(({ entry, analysis }) => [entry.id, analysis])),
    rows: buildInventoryRows(plan.inventory, pending),
    crafts,
    craftsByOutput: groupCraftsByOutput(crafts),
  };
}
