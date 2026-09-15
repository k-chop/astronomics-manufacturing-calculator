import { getAliasItems } from "../data/aliases";
import {
  type AsteroidId,
  type AsteroidName,
  asteroidIds,
  type Composition,
  getAsteroidComposition,
  getGenericComposition,
  type NebulaId,
  resolveLocation,
} from "../data/asteroid";
import { rawMaterials } from "../data/raw-materials";
import type { InventoryRow } from "./production-plan-utils";

export type SiteItem = { item: string; missing: number };

export type RouteStop = {
  id: AsteroidId;
  anyOf: Composition | null; // 載っているものが全部「この組成ならどこでも取れるもの」なら、その組成（id は代表にすぎない）
  items: SiteItem[]; // この停泊地で集める目的のもの
  bonus: SiteItem[]; // ついでに狙えるかもしれないガス（小惑星での出現はレアなので目的には数えない）。anyOf があるときは空
};

export type NebulaStop = { id: NebulaId; items: SiteItem[] };

/**
 * 集めるもののうち足りないものを、どの順に回れば全部揃うかにしたもの
 * stops → nebulae の順に回り、anywhere は途中のどの小惑星でも拾える
 */
export type CollectionRoute = {
  stops: RouteStop[];
  nebulae: NebulaStop[];
  anywhere: SiteItem[]; // どの小惑星でも取れるもの（Biomass）
};

/**
 * アイテムの採取地。エイリアスなら構成アイテムの採取地の和集合（出現順）
 */
export function getItemLocations(item: string): AsteroidName[] {
  const aliasItems = getAliasItems(item);
  if (aliasItems === undefined) return rawMaterials[item]?.foundOn ?? [];
  return [...new Set(aliasItems.flatMap((aliasItem) => rawMaterials[aliasItem]?.foundOn ?? []))];
}

function isGas(item: string): boolean {
  return rawMaterials[item]?.category === "gases";
}

type Target = {
  siteItem: SiteItem;
  asteroids: Set<AsteroidId>;
  compositions: Set<Composition>; // 「この組成ならどこでも取れる」指定があればその組成
  nebulae: NebulaId[];
  anywhere: boolean;
  gas: boolean;
};

function toTarget(row: InventoryRow): Target {
  const target: Target = {
    siteItem: { item: row.item, missing: row.missing },
    asteroids: new Set(),
    compositions: new Set(),
    nebulae: [],
    anywhere: false,
    gas: isGas(row.item),
  };
  for (const location of getItemLocations(row.item)) {
    const composition = getGenericComposition(location);
    if (composition !== undefined) target.compositions.add(composition);
    for (const site of resolveLocation(location)) {
      if (site.kind === "any") target.anywhere = true;
      else if (site.kind === "nebula") target.nebulae.push(site.id);
      else target.asteroids.add(site.id);
    }
  }
  return target;
}

function coveredBy(targets: Iterable<Target>, id: AsteroidId): Target[] {
  return [...targets].filter((target) => target.asteroids.has(id));
}

/**
 * まだ拾えていないものを一番多くカバーする小惑星（同数なら不足数の合計が大きい方、それも同じならテーブル順）
 */
function pickNextStop(uncovered: Set<Target>): AsteroidId | undefined {
  let best: AsteroidId | undefined;
  let bestCount = 0;
  let bestMissing = 0;
  for (const id of asteroidIds) {
    const covered = coveredBy(uncovered, id);
    const missing = covered.reduce((sum, target) => sum + target.siteItem.missing, 0);
    if (covered.length > bestCount || (covered.length === bestCount && missing > bestMissing)) {
      best = id;
      bestCount = covered.length;
      bestMissing = missing;
    }
  }
  return best;
}

/**
 * 在庫パネルの行から「この順に回れば全部揃う」経路を貪欲法で作る
 * 対象は集めるもの（crafted でない）のうち、まだ足りないものだけ。各停泊地内のアイテム順は行の順のまま
 * ガスは星雲で集めるものとして停泊地の選定には数えず、選ばれた停泊地に出現があれば bonus に載せる
 * 停泊地に載るものが全部「その組成ならどこでも取れるもの」なら anyOf にその組成を入れる（特定の小惑星である必要がない）
 */
export function buildCollectionRoute(rows: InventoryRow[]): CollectionRoute {
  const targets = rows.filter((row) => !row.crafted && row.missing > 0).map(toTarget);
  const gases = targets.filter((target) => target.gas);
  const uncovered = new Set(targets.filter((target) => !target.gas && target.asteroids.size > 0));

  const stops: RouteStop[] = [];
  while (uncovered.size > 0) {
    const id = pickNextStop(uncovered);
    if (id === undefined) break;
    const covered = coveredBy(uncovered, id);
    for (const target of covered) uncovered.delete(target);
    const composition = getAsteroidComposition(id);
    const anyOf = covered.every((target) => target.compositions.has(composition)) ? composition : null;
    stops.push({
      id,
      anyOf,
      items: covered.map((target) => target.siteItem),
      bonus: anyOf === null ? coveredBy(gases, id).map((target) => target.siteItem) : [],
    });
  }

  const nebulae = new Map<NebulaId, SiteItem[]>();
  for (const target of targets) {
    for (const id of target.nebulae) nebulae.set(id, [...(nebulae.get(id) ?? []), target.siteItem]);
  }

  return {
    stops,
    nebulae: [...nebulae].map(([id, items]) => ({ id, items })),
    anywhere: targets.filter((target) => target.anywhere).map((target) => target.siteItem),
  };
}

export function hasCollectionRoute(route: CollectionRoute): boolean {
  return route.stops.length > 0 || route.nebulae.length > 0 || route.anywhere.length > 0;
}
