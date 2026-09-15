import { describe, expect, it } from "vitest";

import { buildCollectionRoute, getItemLocations } from "./collection-route";
import type { InventoryRow } from "./production-plan-utils";

function row(item: string, missing: number, crafted = false): InventoryRow {
  return { item, required: missing, have: 0, missing, crafted };
}

function stopSummary(route: ReturnType<typeof buildCollectionRoute>): [string, string[]][] {
  return route.stops.map((stop) => [stop.id, stop.items.map((siteItem) => siteItem.item)]);
}

describe("getItemLocations", () => {
  it("原材料はその採取地、エイリアスは構成アイテムの採取地の和集合になる", () => {
    expect(getItemLocations("ruby")).toEqual(["TW3", "CV1"]);
    const gemLocations = getItemLocations("any-gem");
    expect(new Set(gemLocations).size).toBe(gemLocations.length);
    expect(gemLocations).toEqual(
      expect.arrayContaining(["CV3", "TW4", "BT3", "TW2", "BT1", "TW3", "CV1", "MM2", "MM3", "TW1", "BT4", "NC4"]),
    );
  });

  it("採取地の分からないものは空になる", () => {
    expect(getItemLocations("graphite")).toEqual([]);
  });
});

describe("buildCollectionRoute", () => {
  it("作るものと足りているものは対象にならない", () => {
    const route = buildCollectionRoute([row("nickel", 0), row("copper", 5, true)]);
    expect(route).toEqual({ stops: [], nebulae: [], anywhere: [] });
  });

  it("1 か所で全部揃うならその 1 停泊だけになり、アイテム順は行の順", () => {
    // nickel: CC1, CC4, MM2, TW2, BT2, NC2 / copper: CC2, MM4, BT2, CV2, NC1 / gold: TW4, BT2
    const route = buildCollectionRoute([row("nickel", 10), row("copper", 4), row("gold", 1)]);
    expect(route.stops).toEqual([
      {
        id: "BT2",
        items: [
          { item: "nickel", missing: 10 },
          { item: "copper", missing: 4 },
          { item: "gold", missing: 1 },
        ],
        bonus: [],
      },
    ]);
  });

  it("まだ拾えていないものを一番多くカバーする順に停泊し、同数なら不足数の合計が大きい方を先にする", () => {
    // magnesite: TW1, CV4 / silver: CC4, MM4, TW1, BT2, CV1 / carbon: 炭素質 / iron: 金属質 / cobalt: MM1, TW2, CV4
    // TW1 は magnesite + silver + carbon（1800）、CV4 は magnesite + iron + cobalt（2050）で CV4 が先。残りの silver + carbon は TW1
    const route = buildCollectionRoute([
      row("magnesite", 650),
      row("silver", 650),
      row("carbon", 500),
      row("iron", 600),
      row("cobalt", 800),
    ]);
    expect(stopSummary(route)).toEqual([
      ["CV4", ["magnesite", "iron", "cobalt"]],
      ["TW1", ["silver", "carbon"]],
    ]);
  });

  it("同数で不足数も同じならテーブル順で先の小惑星になる", () => {
    const route = buildCollectionRoute([row("carbon", 50)]);
    expect(stopSummary(route)).toEqual([["CC1", ["carbon"]]]);
  });

  it("Biomass は停泊地にはならず anywhere に入る", () => {
    const route = buildCollectionRoute([row("biomass", 500)]);
    expect(route.stops).toEqual([]);
    expect(route.anywhere).toEqual([{ item: "biomass", missing: 500 }]);
  });

  it("ガスは停泊地の選定に数えず、星雲に載る。選ばれた停泊地に出現があれば bonus に載る", () => {
    // sapphire: MM2, MM3, CV3 / argon-gas: MM2, CV1, argon-gas-nebula
    const route = buildCollectionRoute([row("sapphire", 2), row("argon-gas", 3)]);
    expect(route.stops).toEqual([
      { id: "MM2", items: [{ item: "sapphire", missing: 2 }], bonus: [{ item: "argon-gas", missing: 3 }] },
    ]);
    expect(route.nebulae).toEqual([{ id: "argon-gas-nebula", items: [{ item: "argon-gas", missing: 3 }] }]);
  });

  it("ガスだけなら停泊地は無く星雲だけになる", () => {
    const route = buildCollectionRoute([row("hydrogen-gas", 900)]);
    expect(route.stops).toEqual([]);
    expect(route.nebulae).toEqual([{ id: "hydrogen-gas-nebula", items: [{ item: "hydrogen-gas", missing: 900 }] }]);
  });

  it("Any Gem は構成アイテムの採取地のどれかが停泊地になる", () => {
    const route = buildCollectionRoute([row("any-gem", 2)]);
    expect(route.stops).toHaveLength(1);
    expect(getItemLocations("any-gem")).toContain(route.stops[0].id);
    expect(route.stops[0].items).toEqual([{ item: "any-gem", missing: 2 }]);
  });
});
