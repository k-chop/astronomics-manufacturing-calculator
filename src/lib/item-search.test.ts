import { describe, expect, it } from "vitest";

import { searchItems } from "./item-search";

describe("searchItems", () => {
  it("レシピ持ちのアイテムが原材料より先に並ぶ", () => {
    const ids = searchItems("cop").map((result) => result.id);

    expect(ids).toContain("copper-wire");
    expect(ids).toContain("copper");
    expect(ids.indexOf("copper-wire")).toBeLessThan(ids.indexOf("copper"));
  });

  it("原材料とレシピ持ちのフラグを返す", () => {
    const results = searchItems("carbon");
    const carbon = results.find((result) => result.id === "carbon");
    const carbonFiber = results.find((result) => result.id === "carbon-fiber");

    // Carbon は原材料でもあり Carbonator で作ることもできる
    expect(carbon).toMatchObject({ hasRecipe: true, isRaw: true });
    expect(carbonFiber).toMatchObject({ hasRecipe: true, isRaw: false });
  });

  it("原材料のみのアイテムは hasRecipe が false", () => {
    const [chromite] = searchItems("chromite");
    expect(chromite).toMatchObject({ id: "chromite", hasRecipe: false, isRaw: true });
  });

  it("表示名でもマッチする", () => {
    const ids = searchItems("Fiber Optic").map((result) => result.id);
    expect(ids).toEqual(["fiber-optic-strands"]);
  });

  it("マッチしない場合は空配列", () => {
    expect(searchItems("zzz-not-exist")).toEqual([]);
  });
});
