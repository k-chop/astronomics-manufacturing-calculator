import { describe, expect, it } from "vitest";
import { calculateManufacturing } from "./calculator";

describe("calculateManufacturing", () => {
  it("存在しないレシピの場合nullを返す", () => {
    const result = calculateManufacturing("non-existent-item", 10);
    expect(result).toBeNull();
  });

  it("原材料のみのシンプルなレシピ: copper-wire", () => {
    const results = calculateManufacturing("copper-wire", 40);

    expect(results).toEqual([
      {
        totalDuration: 45,
        totalItems: [
          { item: "copper", amount: 30 },
          { item: "iron", amount: 10 },
        ],
        recipes: [
          {
            machine: "converter",
            inputs: [
              { item: "copper", amount: 30 },
              { item: "iron", amount: 10 },
            ],
            outputs: [{ item: "copper-wire", amount: 40 }],
            duration: 45,
            count: 1,
          },
        ],
      },
    ]);
  });

  it("複数の原材料を使うレシピ: steel-rods", () => {
    const results = calculateManufacturing("steel-rods", 25);

    expect(results).toEqual([
      {
        totalDuration: 45,
        totalItems: [
          { item: "iron", amount: 20 },
          { item: "nickel", amount: 5 },
        ],
        recipes: [
          {
            machine: "converter",
            inputs: [
              { item: "iron", amount: 20 },
              { item: "nickel", amount: 5 },
            ],
            outputs: [{ item: "steel-rods", amount: 25 }],
            duration: 45,
            count: 1,
          },
        ],
      },
    ]);
  });

  it("ネストされた依存関係のあるレシピ: glass-sheet", () => {
    const results = calculateManufacturing("glass-sheet", 25);

    expect(results).toEqual([
      {
        totalDuration: 75,
        totalItems: [{ item: "silica", amount: 50 }],
        recipes: [
          {
            machine: "carbonator",
            inputs: [{ item: "sand", amount: 50 }],
            outputs: [{ item: "glass-sheet", amount: 25 }],
            duration: 25,
            count: 1,
          },
          {
            machine: "crusher",
            inputs: [{ item: "silica", amount: 10 }],
            outputs: [{ item: "sand", amount: 10 }],
            duration: 10,
            count: 5,
          },
        ],
      },
    ]);
  });

  it("複数の製造パスを持つアイテム: polymers", () => {
    const results = calculateManufacturing("polymers", 20);

    expect(results).toEqual([
      {
        totalDuration: 25,
        totalItems: [{ item: "biomass", amount: 50 }],
        recipes: [
          {
            machine: "carbonator",
            inputs: [{ item: "biomass", amount: 50 }],
            outputs: [{ item: "polymers", amount: 20 }],
            duration: 25,
            count: 1,
          },
        ],
      },
      {
        totalDuration: 120,
        totalItems: [{ item: "petroleum", amount: 100 }],
        recipes: [
          {
            machine: "clarifier",
            inputs: [{ item: "petroleum", amount: 50 }],
            outputs: [{ item: "polymers", amount: 15 }],
            duration: 60,
            count: 2,
          },
        ],
      },
      {
        totalDuration: 625,
        totalItems: [{ item: "water", amount: 500 }],
        recipes: [
          {
            machine: "carbonator",
            inputs: [{ item: "biomass", amount: 50 }],
            outputs: [{ item: "polymers", amount: 20 }],
            duration: 25,
            count: 1,
          },
          {
            machine: "clarifier",
            inputs: [{ item: "water", amount: 50 }],
            outputs: [{ item: "biomass", amount: 5 }],
            duration: 60,
            count: 10,
          },
        ],
      },
    ]);
  });

  it("複数の製造パスを持つアイテム: purified-water", () => {
    const results = calculateManufacturing("purified-water", 40);

    expect(results).toEqual([
      {
        totalDuration: 60,
        totalItems: [{ item: "water", amount: 50 }],
        recipes: [
          {
            machine: "clarifier",
            inputs: [{ item: "water", amount: 50 }],
            outputs: [{ item: "purified-water", amount: 40 }],
            duration: 60,
            count: 1,
          },
        ],
      },
      {
        totalDuration: 120,
        totalItems: [{ item: "brine", amount: 100 }],
        recipes: [
          {
            machine: "clarifier",
            inputs: [{ item: "brine", amount: 50 }],
            outputs: [{ item: "purified-water", amount: 35 }],
            duration: 60,
            count: 2,
          },
        ],
      },
    ]);
  });

  it("8つの製造パスを持つアイテム: gem-dust", () => {
    const results = calculateManufacturing("gem-dust", 10);

    expect(results).not.toBeNull();
    expect(results).toHaveLength(8);

    // 最初の結果(aquamarine)を確認
    expect(results![0]).toEqual({
      totalDuration: 10,
      totalItems: [{ item: "aquamarine", amount: 10 }],
      recipes: [
        {
          machine: "crusher",
          inputs: [{ item: "aquamarine", amount: 10 }],
          outputs: [{ item: "gem-dust", amount: 10 }],
          duration: 10,
          count: 1,
        },
      ],
    });

    // すべての結果が同じ構造を持つことを確認
    for (const result of results!) {
      expect(result.totalDuration).toBe(10);
      expect(result.totalItems).toHaveLength(1);
      expect(result.totalItems[0].amount).toBe(10);
      expect(result.recipes).toHaveLength(1);
      expect(result.recipes[0].machine).toBe("crusher");
    }
  });

  it("循環参照を含むレシピをスキップ: graphite", () => {
    const results = calculateManufacturing("graphite", 10);

    // carbonは原材料（carbonite-asteroidsで採取可能）だが、biomassからも製造できる
    // 3つのパターン: water経由、biomass直接、carbon直接
    expect(results).toEqual([
      {
        totalDuration: 25,
        totalItems: [{ item: "carbon", amount: 50 }],
        recipes: [
          {
            machine: "carbonator",
            inputs: [{ item: "carbon", amount: 50 }],
            outputs: [{ item: "graphite", amount: 10 }],
            duration: 25,
            count: 1,
          },
        ],
      },
      {
        totalDuration: 150,
        totalItems: [{ item: "biomass", amount: 250 }],
        recipes: [
          {
            machine: "carbonator",
            inputs: [{ item: "carbon", amount: 50 }],
            outputs: [{ item: "graphite", amount: 10 }],
            duration: 25,
            count: 1,
          },
          {
            machine: "carbonator",
            inputs: [{ item: "biomass", amount: 50 }],
            outputs: [{ item: "carbon", amount: 10 }],
            duration: 25,
            count: 5,
          },
        ],
      },
      {
        totalDuration: 3150,
        totalItems: [{ item: "water", amount: 2500 }],
        recipes: [
          {
            machine: "carbonator",
            inputs: [{ item: "carbon", amount: 50 }],
            outputs: [{ item: "graphite", amount: 10 }],
            duration: 25,
            count: 1,
          },
          {
            machine: "carbonator",
            inputs: [{ item: "biomass", amount: 50 }],
            outputs: [{ item: "carbon", amount: 10 }],
            duration: 25,
            count: 5,
          },
          {
            machine: "clarifier",
            inputs: [{ item: "water", amount: 50 }],
            outputs: [{ item: "biomass", amount: 5 }],
            duration: 60,
            count: 50,
          },
        ],
      },
    ]);
  });

  it("複数回の製造が必要なケース: polymers 100個", () => {
    const results = calculateManufacturing("polymers", 100);

    expect(results).toEqual([
      {
        totalDuration: 125,
        totalItems: [{ item: "biomass", amount: 250 }],
        recipes: [
          {
            machine: "carbonator",
            inputs: [{ item: "biomass", amount: 50 }],
            outputs: [{ item: "polymers", amount: 20 }],
            duration: 25,
            count: 5,
          },
        ],
      },
      {
        totalDuration: 420,
        totalItems: [{ item: "petroleum", amount: 350 }],
        recipes: [
          {
            machine: "clarifier",
            inputs: [{ item: "petroleum", amount: 50 }],
            outputs: [{ item: "polymers", amount: 15 }],
            duration: 60,
            count: 7,
          },
        ],
      },
      {
        totalDuration: 3125,
        totalItems: [{ item: "water", amount: 2500 }],
        recipes: [
          {
            machine: "carbonator",
            inputs: [{ item: "biomass", amount: 50 }],
            outputs: [{ item: "polymers", amount: 20 }],
            duration: 25,
            count: 5,
          },
          {
            machine: "clarifier",
            inputs: [{ item: "water", amount: 50 }],
            outputs: [{ item: "biomass", amount: 5 }],
            duration: 60,
            count: 50,
          },
        ],
      },
    ]);
  });
});
