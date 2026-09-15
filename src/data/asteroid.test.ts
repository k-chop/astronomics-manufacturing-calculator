import { describe, expect, it } from "vitest";

import { asteroidIds, resolveLocation } from "./asteroid";

describe("resolveLocation", () => {
  it("個別小惑星はその 1 件になる", () => {
    expect(resolveLocation("CV3")).toEqual([{ kind: "asteroid", id: "CV3" }]);
  });

  it("組成指定はその組成の小惑星すべてにテーブル順で展開される", () => {
    expect(
      resolveLocation("carbonite-asteroids").map((site) => (site.kind === "asteroid" ? site.id : site.kind)),
    ).toEqual(["CC1", "CC3", "MM2", "TW1", "TW2", "BT4", "CV2", "NC1", "NC4"]);
    // 3 つの組成で全小惑星を過不足なく分け合う
    const all = ["carbonite-asteroids", "metallic-asteroids", "silicate-asteroids"] as const;
    const expanded = all
      .flatMap((generic) => resolveLocation(generic))
      .map((site) => (site.kind === "asteroid" ? site.id : site.kind));
    expect(expanded.toSorted()).toEqual([...asteroidIds].toSorted());
  });

  it("any は展開されず any のまま", () => {
    expect(resolveLocation("any")).toEqual([{ kind: "any" }]);
  });

  it("星雲は nebula になる", () => {
    expect(resolveLocation("argon-gas-nebula")).toEqual([{ kind: "nebula", id: "argon-gas-nebula" }]);
  });
});
