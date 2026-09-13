import { describe, expect, it } from "vitest";

import type { ProductionPlan } from "../types/production-plan";
import { calculateManufacturing } from "./calculator";
import { migrateProductionPlan } from "./production-plan-storage";
import {
  addItemToPlan,
  addUpgradeToPlan,
  aggregateMaterials,
  getEntryMaterials,
  getUpgradeRequirementMaterials,
  toggleItemCompletion,
  updateMaterialProgress,
} from "./production-plan-utils";

const emptyPlan: ProductionPlan = { items: [] };

describe("addUpgradeToPlan", () => {
  it("原材料だけの要求はそのまま進捗に登録される: fuel-capacity Lv1", () => {
    const plan = addUpgradeToPlan(emptyPlan, "fuel-capacity", 1);

    expect(plan.items).toHaveLength(1);
    const entry = plan.items[0];
    expect(entry.kind).toBe("upgrade");
    expect(entry.completed).toBe(false);
    expect(entry.materialProgress).toEqual({
      biomass: { required: 300, collected: 0 },
      carbon: { required: 500, collected: 0 },
    });
  });

  it("レシピ持ちの要求は原材料まで展開される: fuel-capacity Lv2", () => {
    const plan = addUpgradeToPlan(emptyPlan, "fuel-capacity", 2);
    const entry = plan.items[0];

    // Fiber Optic Strands 300 → Gem Dust 300 → Any Gem 300
    expect(entry.materialProgress).toEqual({
      chromite: { required: 400, collected: 0 },
      "any-gem": { required: 300, collected: 0 },
    });
    if (entry.kind !== "upgrade") throw new Error("upgrade エントリではない");
    expect(entry.upgradeId).toBe("fuel-capacity");
    expect(entry.level).toBe(2);
    expect(entry.requirements.map((requirement) => requirement.calculationResults === null)).toEqual([true, false]);
  });

  it("原材料かつレシピ持ちのアイテム（Salt）は展開せず直接採取扱いになる: shuttle-storage Lv1", () => {
    const plan = addUpgradeToPlan(emptyPlan, "shuttle-storage", 1);
    const entry = plan.items[0];

    expect(entry.materialProgress).toEqual({ salt: { required: 250, collected: 0 } });
    if (entry.kind !== "upgrade") throw new Error("upgrade エントリではない");
    expect(entry.requirements[0].calculationResults).toBeNull();
  });

  it("存在しないアップグレードやレベルの場合は plan を変更しない", () => {
    expect(addUpgradeToPlan(emptyPlan, "fuel-capacity", 99)).toBe(emptyPlan);
    expect(addUpgradeToPlan(emptyPlan, "unknown-upgrade", 1)).toBe(emptyPlan);
  });
});

describe("getUpgradeRequirementMaterials", () => {
  it("原材料の要求と展開結果に同じアイテムがあれば合算される", () => {
    const materials = getUpgradeRequirementMaterials([
      { item: "carbon", amount: 100, calculationResults: null },
      // Graphite 50 → Carbon 250
      { item: "graphite", amount: 50, calculationResults: calculateManufacturing("graphite", 50) },
    ]);

    expect(materials).toEqual([{ item: "carbon", amount: 350 }]);
  });
});

describe("aggregateMaterials", () => {
  it("item と upgrade の両エントリを合算し、収集済みと完了済みを除く", () => {
    // Copper Wire 40 → Copper 30, Iron 10
    const copperWireResults = calculateManufacturing("copper-wire", 40);
    if (!copperWireResults) throw new Error("copper-wire のレシピがない");

    let plan = addItemToPlan(emptyPlan, "copper-wire", 40, copperWireResults);
    // Manufacturing Lv1: Cobalt 800, Iron 1000
    plan = addUpgradeToPlan(plan, "manufacturing", 1);
    // Fuel Capacity Lv1: Biomass 300, Carbon 500（完了済みにして除外する）
    plan = addUpgradeToPlan(plan, "fuel-capacity", 1);
    plan = toggleItemCompletion(plan, plan.items[2].id);
    // Cobalt を 300 収集済みにする
    plan = updateMaterialProgress(plan, plan.items[1].id, "cobalt", 300);

    expect(aggregateMaterials(plan)).toEqual([
      { item: "copper", amount: 30 },
      { item: "iron", amount: 1010 },
      { item: "cobalt", amount: 500 },
    ]);
  });
});

describe("getEntryMaterials", () => {
  it("item エントリは選択中パターンの原材料を返す", () => {
    const results = calculateManufacturing("copper-wire", 40);
    if (!results) throw new Error("copper-wire のレシピがない");
    const plan = addItemToPlan(emptyPlan, "copper-wire", 40, results);

    expect(getEntryMaterials(plan.items[0])).toEqual([
      { item: "copper", amount: 30 },
      { item: "iron", amount: 10 },
    ]);
  });
});

describe("migrateProductionPlan", () => {
  it("kind のない旧形式のエントリに kind: item を付与する", () => {
    const results = calculateManufacturing("copper-wire", 40);
    const legacy = {
      items: [
        {
          id: "legacy-1",
          itemId: "copper-wire",
          amount: 40,
          selectedPatternIndex: 0,
          completed: false,
          calculationResults: results,
          materialProgress: { copper: { required: 30, collected: 0 }, iron: { required: 10, collected: 0 } },
        },
      ],
    };

    const migrated = migrateProductionPlan(legacy);
    expect(migrated.items).toHaveLength(1);
    expect(migrated.items[0].kind).toBe("item");
    expect(migrated.items[0]).toMatchObject(legacy.items[0]);
  });

  it("kind を持つエントリはそのまま返す", () => {
    const plan = addUpgradeToPlan(emptyPlan, "shuttle-forge", 1);
    expect(migrateProductionPlan(JSON.parse(JSON.stringify(plan)))).toEqual(plan);
  });

  it("不正な値は空の plan にする", () => {
    expect(migrateProductionPlan(null)).toEqual({ items: [] });
    expect(migrateProductionPlan({ foo: 1 })).toEqual({ items: [] });
    expect(migrateProductionPlan({ items: "x" })).toEqual({ items: [] });
  });
});
