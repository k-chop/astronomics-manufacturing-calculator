import { describe, expect, it } from "vitest";

import { findRecipesUsingItem, findUpgradesRequiringItem } from "./item-usage";

describe("findRecipesUsingItem", () => {
  it("直接入力に使うレシピを返す: copper → copper-wire", () => {
    const usages = findRecipesUsingItem("copper");

    expect(usages.map((usage) => usage.outputItem)).toEqual(["copper-wire"]);
    expect(usages[0].viaAlias).toBeNull();
    expect(usages[0].method.machine).toBe("converter");
  });

  it("エイリアス経由で使われるレシピも返す: ruby → gem-dust (as any-gem)", () => {
    const usages = findRecipesUsingItem("ruby");

    expect(usages).toHaveLength(1);
    expect(usages[0]).toMatchObject({ outputItem: "gem-dust", viaAlias: "any-gem" });
  });

  it("複数のレシピで使われる場合はすべて返す: biomass", () => {
    const outputs = findRecipesUsingItem("biomass").map((usage) => usage.outputItem);

    expect(outputs).toEqual(["carbon", "polymers", "resin"]);
  });

  it("どのレシピにも使われない場合は空配列: mercury", () => {
    expect(findRecipesUsingItem("mercury")).toEqual([]);
  });
});

describe("findUpgradesRequiringItem", () => {
  it("要求するアップグレードとレベル、数量を返す", () => {
    expect(findUpgradesRequiringItem("chromite")).toEqual([{ upgradeId: "fuel-capacity", level: 2, amount: 400 }]);
    expect(findUpgradesRequiringItem("mercury")).toEqual([{ upgradeId: "shuttle-equipment", level: 3, amount: 400 }]);
  });

  it("複数のアップグレードで要求される場合はすべて返す: graphite", () => {
    expect(findUpgradesRequiringItem("graphite")).toEqual([
      { upgradeId: "manufacturing", level: 2, amount: 500 },
      { upgradeId: "storage-capacity", level: 1, amount: 350 },
    ]);
  });

  it("どのアップグレードにも要求されない場合は空配列", () => {
    expect(findUpgradesRequiringItem("water")).toEqual([]);
  });
});
