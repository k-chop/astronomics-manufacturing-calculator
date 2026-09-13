import { describe, expect, it } from "vitest";

import type { ProductionPlan } from "../types/production-plan";
import { calculateManufacturing } from "./calculator";
import { parseProductionPlan } from "./production-plan-storage";
import {
  addItemToPlan,
  addUpgradeToPlan,
  analyzeEntry,
  emptyProductionPlan,
  getCraftableRuns,
  getEntrySteps,
  analyzePlan,
  getUpgradeRequirementMaterials,
  isMaterialsCovered,
  recordStepRuns,
  removeItemFromPlan,
  setInventory,
  toggleItemCompletion,
} from "./production-plan-utils";

function results(itemId: string, amount: number) {
  const calculated = calculateManufacturing(itemId, amount);
  if (!calculated) throw new Error(`${itemId} のレシピがない`);
  return calculated;
}

/**
 * Graphite 20 の Pattern 2: Carbonator(carbon 50 → graphite 10) ×2, Carbonator(biomass 50 → carbon 10) ×10
 * 原材料は biomass 500
 */
function graphitePlan(inventory: ProductionPlan["inventory"] = {}): ProductionPlan {
  const plan = addItemToPlan({ ...emptyProductionPlan, inventory }, "graphite", 20, results("graphite", 20), 1);
  const steps = getEntrySteps(plan.items[0]);
  expect(steps.map((step) => `${step.inputs[0].item}>${step.outputs[0].item}x${step.count}`)).toEqual([
    "carbon>graphitex2",
    "biomass>carbonx10",
  ]);
  return plan;
}

describe("addItemToPlan", () => {
  // Carbon 10 は「Biomass を採取」と「Water → Biomass」の2パターン
  const carbonResults = results("carbon", 10);

  it("省略時は最速パターン（index 0）で追加され、stepProgress が 0 埋めになる", () => {
    const plan = addItemToPlan(emptyProductionPlan, "carbon", 10, carbonResults);
    const entry = plan.items[0];

    expect(carbonResults).toHaveLength(2);
    if (entry.kind !== "item") throw new Error("item エントリではない");
    expect(entry.selectedPatternIndex).toBe(0);
    expect(entry.stepProgress).toEqual([0]);
    expect(entry.calculationResults[entry.selectedPatternIndex].totalItems).toEqual([{ item: "biomass", amount: 50 }]);
  });

  it("指定したパターンで追加され、原材料もそのパターンのものになる", () => {
    const plan = addItemToPlan(emptyProductionPlan, "carbon", 10, carbonResults, 1);
    const entry = plan.items[0];

    if (entry.kind !== "item") throw new Error("item エントリではない");
    expect(entry.selectedPatternIndex).toBe(1);
    expect(entry.stepProgress).toEqual([0, 0]);
    expect(entry.calculationResults[entry.selectedPatternIndex].totalItems).toEqual([{ item: "water", amount: 500 }]);
  });

  it("範囲外のパターン index は 0 に丸められる", () => {
    const plan = addItemToPlan(emptyProductionPlan, "carbon", 10, carbonResults, 99);
    const entry = plan.items[0];
    if (entry.kind !== "item") throw new Error("item エントリではない");
    expect(entry.selectedPatternIndex).toBe(0);
  });

  it("在庫は引き継がれる", () => {
    const plan = addItemToPlan({ ...emptyProductionPlan, inventory: { iron: 5 } }, "carbon", 10, carbonResults);
    expect(plan.inventory).toEqual({ iron: 5 });
  });
});

describe("addUpgradeToPlan", () => {
  it("原材料だけの要求はステップを持たず、そのまま必要数になる: fuel-capacity Lv1", () => {
    const plan = addUpgradeToPlan(emptyProductionPlan, "fuel-capacity", 1);
    const entry = plan.items[0];

    expect(entry.kind).toBe("upgrade");
    expect(entry.stepProgress).toEqual([]);
    expect(analyzeEntry(entry, {}).materials).toEqual([
      { item: "biomass", need: 300, have: 0, shortage: 300 },
      { item: "carbon", need: 500, have: 0, shortage: 500 },
    ]);
  });

  it("レシピ持ちの要求は原材料まで展開される: fuel-capacity Lv2", () => {
    const plan = addUpgradeToPlan(emptyProductionPlan, "fuel-capacity", 2);
    const entry = plan.items[0];

    // Fiber Optic Strands 300 → Gem Dust 300 → Any Gem 300
    expect(analyzeEntry(entry, {}).materials).toEqual([
      { item: "chromite", need: 400, have: 0, shortage: 400 },
      { item: "any-gem", need: 300, have: 0, shortage: 300 },
    ]);
    if (entry.kind !== "upgrade") throw new Error("upgrade エントリではない");
    expect(entry.requirements.map((requirement) => requirement.calculationResults === null)).toEqual([true, false]);
    expect(entry.stepProgress).toEqual([0, 0]);
  });

  it("原材料かつレシピ持ちのアイテム（Salt）は展開せず直接採取扱いになる: shuttle-storage Lv1", () => {
    const plan = addUpgradeToPlan(emptyProductionPlan, "shuttle-storage", 1);
    const entry = plan.items[0];

    expect(analyzeEntry(entry, {}).materials).toEqual([{ item: "salt", need: 250, have: 0, shortage: 250 }]);
    if (entry.kind !== "upgrade") throw new Error("upgrade エントリではない");
    expect(entry.requirements[0].calculationResults).toBeNull();
  });

  it("存在しないアップグレードやレベルの場合は plan を変更しない", () => {
    expect(addUpgradeToPlan(emptyProductionPlan, "fuel-capacity", 99)).toBe(emptyProductionPlan);
    expect(addUpgradeToPlan(emptyProductionPlan, "unknown-upgrade", 1)).toBe(emptyProductionPlan);
  });
});

describe("getUpgradeRequirementMaterials", () => {
  it("原材料の要求と展開結果に同じアイテムがあれば合算される", () => {
    const materials = getUpgradeRequirementMaterials([
      { item: "carbon", amount: 100, calculationResults: null },
      // Graphite 50 → Carbon 250
      { item: "graphite", amount: 50, calculationResults: results("graphite", 50) },
    ]);

    expect(materials).toEqual([{ item: "carbon", amount: 350 }]);
  });
});

describe("analyzeEntry", () => {
  it("未着手なら原材料だけが必要で、中間材料は一覧に出ない", () => {
    const plan = graphitePlan();
    const { steps, materials } = analyzeEntry(plan.items[0], {});

    expect(materials).toEqual([{ item: "biomass", need: 500, have: 0, shortage: 500 }]);
    expect(steps.map((step) => [step.usefulRuns, step.craftableNow])).toEqual([
      [2, 0],
      [10, 0],
    ]);
  });

  it("途中まで実行すると残りの原材料だけが必要になる", () => {
    let plan = graphitePlan({ biomass: 500 });
    // biomass → carbon を 3 回実行済み: 在庫 carbon 30、残り 7 回で 70 作れるので carbon は足りる
    plan = recordStepRuns(plan, plan.items[0].id, 1, 3);
    const { steps, materials } = analyzeEntry(plan.items[0], plan.inventory);

    expect(materials).toEqual([{ item: "biomass", need: 350, have: 350, shortage: 0 }]);
    expect(steps.map((step) => [step.done, step.usefulRuns, step.craftableNow])).toEqual([
      [0, 2, 0],
      [3, 7, 7],
    ]);
  });

  it("中間材料が在庫にあれば子ステップは不要になり、その原材料も要求しない", () => {
    const plan = graphitePlan({ carbon: 100 });
    const { steps, materials } = analyzeEntry(plan.items[0], plan.inventory);

    expect(materials).toEqual([]);
    expect(steps.map((step) => [step.usefulRuns, step.craftableNow])).toEqual([
      [2, 2],
      [0, 0],
    ]);
  });

  it("中間材料が一部だけ在庫にあれば、足りない分だけ子ステップを実行する", () => {
    const plan = graphitePlan({ carbon: 55 });
    const { steps, materials } = analyzeEntry(plan.items[0], plan.inventory);

    // carbon は 45 不足 → biomass → carbon を 5 回（50 作る）
    expect(materials).toEqual([{ item: "biomass", need: 250, have: 0, shortage: 250 }]);
    expect(steps.map((step) => step.usefulRuns)).toEqual([2, 5]);
  });

  it("作れる回数を使い切っても足りない中間材料は不足として出る", () => {
    let plan = graphitePlan({ biomass: 500 });
    const id = plan.items[0].id;
    // carbon を 10 回作って 100 得た後、carbon を在庫から手で減らす（他で使った想定）
    plan = recordStepRuns(plan, id, 1, 10);
    plan = setInventory(plan, "carbon", 40);
    const { materials } = analyzeEntry(plan.items[0], plan.inventory);

    expect(materials).toEqual([{ item: "carbon", need: 100, have: 40, shortage: 60 }]);
  });

  it("全ステップ完了なら何も必要ない", () => {
    let plan = graphitePlan({ biomass: 500 });
    const id = plan.items[0].id;
    plan = recordStepRuns(plan, id, 1, 10);
    plan = recordStepRuns(plan, id, 0, 2);
    expect(analyzeEntry(plan.items[0], plan.inventory).materials).toEqual([]);
  });

  it("upgrade のレシピ持ち要求は、在庫にあれば作らなくてよい", () => {
    // Shuttle Equipment Lv5: Oxygen Gas 650 + Quantum Data Drives 20
    const plan = addUpgradeToPlan(emptyProductionPlan, "shuttle-equipment", 5);
    const entry = plan.items[0];

    const without = analyzeEntry(entry, {});
    expect(without.materials.map((material) => material.item)).toContain("helium-gas");
    expect(without.steps[0].usefulRuns).toBe(1);

    const withDrives = analyzeEntry(entry, { "quantum-data-drives": 20 });
    expect(withDrives.materials).toEqual([{ item: "oxygen-gas", need: 650, have: 0, shortage: 650 }]);
    expect(withDrives.steps.every((step) => step.usefulRuns === 0)).toBe(true);
  });
});

describe("recordStepRuns", () => {
  it("実行を記録すると入力が減り出力が増える", () => {
    let plan = graphitePlan({ biomass: 500 });
    const id = plan.items[0].id;

    plan = recordStepRuns(plan, id, 1, 3);
    expect(plan.inventory).toEqual({ biomass: 350, carbon: 30 });
    expect(plan.items[0].stepProgress).toEqual([0, 3]);

    plan = recordStepRuns(plan, id, 1, -1);
    expect(plan.inventory).toEqual({ biomass: 400, carbon: 20 });
    expect(plan.items[0].stepProgress).toEqual([0, 2]);
  });

  it("count を超えず 0 未満にもならない", () => {
    let plan = graphitePlan({ biomass: 10000 });
    const id = plan.items[0].id;

    plan = recordStepRuns(plan, id, 1, 99);
    expect(plan.items[0].stepProgress).toEqual([0, 10]);
    expect(plan.inventory).toEqual({ biomass: 9500, carbon: 100 });

    plan = recordStepRuns(plan, id, 1, -99);
    expect(plan.items[0].stepProgress).toEqual([0, 0]);
    expect(plan.inventory).toEqual({ biomass: 10000 });
  });

  it("在庫が足りなくても記録でき、在庫は 0 で止まる", () => {
    let plan = graphitePlan({ biomass: 20 });
    plan = recordStepRuns(plan, plan.items[0].id, 1, 1);
    expect(plan.inventory).toEqual({ carbon: 10 });
  });

  it("item エントリは最終ステップ完了で completed になり、戻すと解除される", () => {
    let plan = graphitePlan({ biomass: 500 });
    const id = plan.items[0].id;

    plan = recordStepRuns(plan, id, 1, 10);
    expect(plan.items[0].completed).toBe(false);
    plan = recordStepRuns(plan, id, 0, 2);
    expect(plan.items[0].completed).toBe(true);
    expect(plan.inventory).toEqual({ graphite: 20 });

    plan = recordStepRuns(plan, id, 0, -1);
    expect(plan.items[0].completed).toBe(false);
  });

  it("存在しないエントリやステップは plan を変更しない", () => {
    const plan = graphitePlan();
    expect(recordStepRuns(plan, "no-such-id", 0, 1)).toBe(plan);
    expect(recordStepRuns(plan, plan.items[0].id, 99, 1)).toBe(plan);
    expect(recordStepRuns(plan, plan.items[0].id, 0, 0)).toBe(plan);
  });
});

describe("getCraftableRuns", () => {
  it("在庫と残り回数から実行可能回数を求める", () => {
    const [toGraphite, toCarbon] = getEntrySteps(graphitePlan().items[0]);

    expect(getCraftableRuns(toCarbon, 0, { biomass: 120 })).toBe(2);
    expect(getCraftableRuns(toCarbon, 9, { biomass: 120 })).toBe(1);
    expect(getCraftableRuns(toCarbon, 10, { biomass: 120 })).toBe(0);
    expect(getCraftableRuns(toGraphite, 0, {})).toBe(0);
  });

  it("入力が複数なら不足しているもので決まる", () => {
    const [copperWire] = results("copper-wire", 80)[0].recipes; // copper 30 + iron 10 → 40, count 2
    expect(getCraftableRuns(copperWire, 0, { copper: 100 })).toBe(0);
    expect(getCraftableRuns(copperWire, 0, { copper: 100, iron: 10 })).toBe(1);
    expect(getCraftableRuns(copperWire, 0, { copper: 100, iron: 100 })).toBe(2);
  });
});

describe("isMaterialsCovered", () => {
  it("在庫との差分から充足を判定する", () => {
    const plan = graphitePlan({ biomass: 120 });
    const { materials } = analyzeEntry(plan.items[0], plan.inventory);

    expect(materials).toEqual([{ item: "biomass", need: 500, have: 120, shortage: 380 }]);
    expect(isMaterialsCovered(materials)).toBe(false);
    expect(isMaterialsCovered(analyzeEntry(plan.items[0], { biomass: 600 }).materials)).toBe(true);
  });
});

describe("analyzeEntry の readyToFinish", () => {
  it("upgrade は要求資源がすべて在庫にあれば ready", () => {
    const plan = addUpgradeToPlan(emptyProductionPlan, "fuel-capacity", 2);
    const entry = plan.items[0];
    expect(analyzeEntry(entry, { chromite: 400, "fiber-optic-strands": 299 }).readyToFinish).toBe(false);
    expect(analyzeEntry(entry, { chromite: 400, "fiber-optic-strands": 300 }).readyToFinish).toBe(true);
  });

  it("item は最終レシピの残りをすべて今の在庫で実行できれば ready", () => {
    const plan = graphitePlan();
    const entry = plan.items[0];
    // carbon 50 → graphite 10 を 2 回: carbon 100 で ready、biomass だけでは ready ではない
    expect(analyzeEntry(entry, { biomass: 500 }).readyToFinish).toBe(false);
    expect(analyzeEntry(entry, { carbon: 50 }).readyToFinish).toBe(false);
    expect(analyzeEntry(entry, { carbon: 100 }).readyToFinish).toBe(true);
  });

  it("完了済みは ready ではない", () => {
    let plan = addUpgradeToPlan(
      { ...emptyProductionPlan, inventory: { chromite: 400, "fiber-optic-strands": 300 } },
      "fuel-capacity",
      2,
    );
    plan = toggleItemCompletion(plan, plan.items[0].id);
    expect(analyzeEntry(plan.items[0], plan.inventory).readyToFinish).toBe(false);
  });
});

describe("toggleItemCompletion", () => {
  it("upgrade を完了にすると要求資源が在庫から減り、戻すと戻る", () => {
    let plan = addUpgradeToPlan({ ...emptyProductionPlan, inventory: { chromite: 500 } }, "fuel-capacity", 2);
    const id = plan.items[0].id;

    plan = toggleItemCompletion(plan, id);
    expect(plan.items[0].completed).toBe(true);
    // chromite 400、fiber-optic-strands 300（在庫になかったので 0 で止まる）
    expect(plan.inventory).toEqual({ chromite: 100 });

    plan = toggleItemCompletion(plan, id);
    expect(plan.items[0].completed).toBe(false);
    expect(plan.inventory).toEqual({ chromite: 500, "fiber-optic-strands": 300 });
  });

  it("item エントリは在庫を変えない", () => {
    let plan = graphitePlan({ biomass: 10 });
    plan = toggleItemCompletion(plan, plan.items[0].id);
    expect(plan.items[0].completed).toBe(true);
    expect(plan.inventory).toEqual({ biomass: 10 });
  });
});

describe("setInventory", () => {
  it("在庫を設定し、0 以下は削除する", () => {
    let plan = setInventory(emptyProductionPlan, "iron", 30);
    expect(plan.inventory).toEqual({ iron: 30 });
    plan = setInventory(plan, "iron", 0);
    expect(plan.inventory).toEqual({});
    plan = setInventory(plan, "iron", -5);
    expect(plan.inventory).toEqual({});
  });
});

describe("analyzePlan の rows", () => {
  it("複数エントリの必要数を合算し、完了済みは除き、どのプランも使わない在庫は行に出ない", () => {
    // Copper Wire 40 → copper 30, iron 10 / Manufacturing Lv1 → cobalt 800, iron 1000
    let plan = addItemToPlan(
      { ...emptyProductionPlan, inventory: { iron: 100, silver: 7 } },
      "copper-wire",
      40,
      results("copper-wire", 40),
    );
    plan = addUpgradeToPlan(plan, "manufacturing", 1);
    plan = addUpgradeToPlan(plan, "fuel-capacity", 1);
    plan = toggleItemCompletion(plan, plan.items[2].id);

    expect(analyzePlan(plan).rows).toEqual([
      { item: "iron", required: 1010, have: 100, missing: 910 },
      { item: "cobalt", required: 800, have: 0, missing: 800 },
      { item: "copper", required: 30, have: 0, missing: 30 },
    ]);
  });

  it("完了後に余った成果物は行に出ない", () => {
    // Shuttle Equipment Lv5: Quantum Data Drives 20 だが Constructor は 85 作るので 65 余る
    let plan = addUpgradeToPlan(emptyProductionPlan, "shuttle-equipment", 5);
    const id = plan.items[0].id;
    plan = setInventory(plan, "quantum-data-drives", 85);
    plan = setInventory(plan, "oxygen-gas", 650);
    expect(analyzePlan(plan).rows).toEqual([
      { item: "oxygen-gas", required: 650, have: 650, missing: 0 },
      { item: "quantum-data-drives", required: 20, have: 85, missing: 0 },
    ]);

    plan = toggleItemCompletion(plan, id);
    expect(plan.inventory).toEqual({ "quantum-data-drives": 65 });
    expect(analyzePlan(plan).rows).toEqual([]);
  });
});

describe("analyzePlan の rows と中間材料", () => {
  it("残りステップで作る中間材料も行に出て、作れる分は missing に数えない", () => {
    // Shuttle Equipment Delivery Lv1: Fiber Optic Strands 400 ← Gem Dust 400 ← Any Gem 400
    let plan = addUpgradeToPlan(emptyProductionPlan, "shuttle-equipment-delivery", 1);
    const id = plan.items[0].id;
    expect(analyzePlan(plan).rows).toEqual([
      { item: "fiber-optic-strands", required: 400, have: 0, missing: 0 },
      { item: "gem-dust", required: 400, have: 0, missing: 0 },
      { item: "any-gem", required: 400, have: 0, missing: 400 },
    ]);

    // Any Gem を用意して Gem Dust を全部作る: Gem Dust の行が残り、次のクラフトがそこに出る
    plan = setInventory(plan, "any-gem", 400);
    plan = recordStepRuns(plan, id, 1, 40);
    expect(plan.inventory).toEqual({ "gem-dust": 400 });
    expect(analyzePlan(plan).rows).toEqual([
      { item: "fiber-optic-strands", required: 400, have: 0, missing: 0 },
      { item: "gem-dust", required: 400, have: 400, missing: 0 },
    ]);
    const crafts = analyzePlan(plan).craftsByInput.get("gem-dust");
    expect(crafts?.map((craft) => [craft.recipe.outputs[0].item, craft.runs])).toEqual([["fiber-optic-strands", 8]]);
  });

  it("中間材料が途中まで在庫にある場合は残りの原材料だけが不足になる", () => {
    const plan = addUpgradeToPlan(
      { ...emptyProductionPlan, inventory: { "gem-dust": 150 } },
      "shuttle-equipment-delivery",
      1,
    );
    // gem-dust あと 250 → any-gem 250
    expect(analyzePlan(plan).rows).toEqual([
      { item: "fiber-optic-strands", required: 400, have: 0, missing: 0 },
      { item: "gem-dust", required: 400, have: 150, missing: 0 },
      { item: "any-gem", required: 250, have: 0, missing: 250 },
    ]);
  });
});

describe("removeItemFromPlan", () => {
  it("エントリが残っていれば在庫は保持し、1 つもなくなったら在庫を空にする", () => {
    let plan = addUpgradeToPlan(
      { ...emptyProductionPlan, inventory: { iron: 300, "gem-dust": 400 } },
      "shuttle-forge",
      1,
    );
    plan = addUpgradeToPlan(plan, "shuttle-equipment", 1);
    const [forge, equipment] = plan.items;

    plan = removeItemFromPlan(plan, forge.id);
    expect(plan.items.map((entry) => entry.id)).toEqual([equipment.id]);
    expect(plan.inventory).toEqual({ iron: 300, "gem-dust": 400 });

    plan = toggleItemCompletion(plan, equipment.id);
    plan = removeItemFromPlan(plan, equipment.id);
    expect(plan.items).toEqual([]);
    expect(plan.inventory).toEqual({});
  });
});

describe("analyzePlan の crafts", () => {
  it("在庫で実行できるステップだけを返す", () => {
    let plan = graphitePlan({ biomass: 120 });
    const id = plan.items[0].id;

    let crafts = analyzePlan(plan).crafts;
    expect(crafts.map((craft) => [craft.stepIndex, craft.runs])).toEqual([[1, 2]]);

    plan = setInventory(plan, "carbon", 50);
    crafts = analyzePlan(plan).crafts;
    expect(crafts.map((craft) => [craft.stepIndex, craft.runs])).toEqual([
      [0, 1],
      [1, 2],
    ]);

    plan = toggleItemCompletion(plan, id);
    expect(analyzePlan(plan).crafts).toEqual([]);
  });

  it("入力アイテムごとにまとめられる", () => {
    const plan = graphitePlan({ biomass: 120, carbon: 50 });
    const byInput = analyzePlan(plan).craftsByInput;

    expect(byInput.get("biomass")?.map((craft) => [craft.stepIndex, craft.runs])).toEqual([[1, 2]]);
    expect(byInput.get("carbon")?.map((craft) => [craft.stepIndex, craft.runs])).toEqual([[0, 1]]);
    expect(byInput.has("graphite")).toBe(false);
  });
});

describe("parseProductionPlan", () => {
  it("現在の形式はそのまま返す", () => {
    let plan = graphitePlan({ biomass: 500 });
    plan = recordStepRuns(plan, plan.items[0].id, 1, 2);
    expect(parseProductionPlan(JSON.parse(JSON.stringify(plan)))).toEqual(plan);
  });

  it("不正な値や inventory のない旧形式は空の plan にする", () => {
    expect(parseProductionPlan(null)).toEqual(emptyProductionPlan);
    expect(parseProductionPlan({ foo: 1 })).toEqual(emptyProductionPlan);
    expect(parseProductionPlan({ items: "x" })).toEqual(emptyProductionPlan);
    expect(parseProductionPlan({ items: [] })).toEqual(emptyProductionPlan);
  });
});
