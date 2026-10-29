import { formatNumber } from "../lib/format-utils";
import type { Locale } from "./item-names";

const asteroids = {
  CC1: { name: "CC1", region: "cubecorp", composition: "carbonite" },
  CC2: { name: "CC2", region: "cubecorp", composition: "silicate" },
  CC3: { name: "CC3", region: "cubecorp", composition: "carbonite" },
  CC4: { name: "CC4", region: "cubecorp", composition: "metallic" },
  MM1: { name: "MM1", region: "medusaminerals", composition: "metallic" },
  MM2: { name: "MM2", region: "medusaminerals", composition: "carbonite" },
  MM3: { name: "MM3", region: "medusaminerals", composition: "metallic" },
  MM4: { name: "MM4", region: "medusaminerals", composition: "silicate" },
  TW1: { name: "TW1", region: "twgems", composition: "carbonite" },
  TW2: { name: "TW2", region: "twgems", composition: "carbonite" },
  TW3: { name: "TW3", region: "twgems", composition: "silicate" },
  TW4: { name: "TW4", region: "twgems", composition: "silicate" },
  BT1: { name: "BT1", region: "blacktidal", composition: "silicate" },
  BT2: { name: "BT2", region: "blacktidal", composition: "metallic" },
  BT3: { name: "BT3", region: "blacktidal", composition: "silicate" },
  BT4: { name: "BT4", region: "blacktidal", composition: "carbonite" },
  CV1: { name: "CV1", region: "ceresvesta", composition: "silicate" },
  CV2: { name: "CV2", region: "ceresvesta", composition: "carbonite" },
  CV3: { name: "CV3", region: "ceresvesta", composition: "silicate" },
  CV4: { name: "CV4", region: "ceresvesta", composition: "metallic" },
  NC1: { name: "NC1", region: "noblecoreag", composition: "carbonite" },
  NC2: { name: "NC2", region: "noblecoreag", composition: "metallic" },
  NC3: { name: "NC3", region: "noblecoreag", composition: "silicate" },
  NC4: { name: "NC4", region: "noblecoreag", composition: "carbonite" },
} as const;

const regionNames = {
  cubecorp: { en: "Cube Corp" },
  medusaminerals: { en: "Medusa Minerals" },
  twgems: { en: "TW Gems" },
  blacktidal: { en: "Black Tidal" },
  ceresvesta: { en: "Ceres Vesta" },
  noblecoreag: { en: "Noblecore AG" },
} as const;

const compositionNames = {
  carbonite: { en: "Carbonite" },
  metallic: { en: "Metallic" },
  silicate: { en: "Silicate" },
} as const;

export type Composition = keyof typeof compositionNames;

// 組成指定（"carbonite-asteroids" など）→ 組成
const compositionByGenericId = {
  "carbonite-asteroids": "carbonite",
  "metallic-asteroids": "metallic",
  "silicate-asteroids": "silicate",
} as const satisfies { [genericId: string]: Composition };

const nebulaNames = {
  "argon-gas-nebula": { en: "Argon Gas Nebula" },
  "chlorine-gas-nebula": { en: "Chlorine Gas Nebula" },
  "helium-gas-nebula": { en: "Helium Gas Nebula" },
  "hydrogen-gas-nebula": { en: "Hydrogen Gas Nebula" },
  "neon-gas-nebula": { en: "Neon Gas Nebula" },
  "nitrogen-gas-nebula": { en: "Nitrogen Gas Nebula" },
  "oxygen-gas-nebula": { en: "Oxygen Gas Nebula" },
} as const;

type RegionId = keyof typeof regionNames;

/**
 * 各リージョンのステーションの depth（Mm）。depth はマップの左右の位置で、全リージョン共通の座標
 * マップは左から右に流れ、各リージョンの左端にそのリージョンのステーションがある
 * Medusa Minerals はゲーム内表示 998 だが 1000 に丸めている
 */
const stationDepths: { [region in RegionId]: number } = {
  cubecorp: 0,
  medusaminerals: 1000,
  twgems: 2000,
  blacktidal: 3700,
  ceresvesta: 5400,
  noblecoreag: 7600,
};

// 星雲の depth（Mm）。同じ種類の星雲が複数あれば複数入れる
const nebulaDepths: { [id in keyof typeof nebulaNames]: number[] } = {
  "argon-gas-nebula": [9200],
  "chlorine-gas-nebula": [8700],
  "helium-gas-nebula": [9600],
  "hydrogen-gas-nebula": [4800],
  "neon-gas-nebula": [8350],
  "nitrogen-gas-nebula": [6900],
  "oxygen-gas-nebula": [8000],
};

export const genericAsteroidNames = {
  // Generic types
  "carbonite-asteroids": { en: "Carbonite Asteroids" },
  "metallic-asteroids": { en: "Metallic Asteroids" },
  "silicate-asteroids": { en: "Silicate Asteroids" },
  any: { en: "Any Asteroid" },

  // Gas nebulae (on the map, not on asteroids)
  ...nebulaNames,
} satisfies {
  [asteroidId: string]: {
    en: string;
  };
};

export type AsteroidId = keyof typeof asteroids;
export type NebulaId = keyof typeof nebulaNames;
export type AsteroidName = AsteroidId | keyof typeof genericAsteroidNames;

/** 個別小惑星の ID をテーブル順で並べたもの（表示順の基準） */
export const asteroidIds = Object.keys(asteroids) as AsteroidId[];

/**
 * 採取地の指定を具体的な場所に展開したもの
 * any は「どの小惑星でも」なので個別には展開しない
 */
export type CollectionSite = { kind: "asteroid"; id: AsteroidId } | { kind: "nebula"; id: NebulaId } | { kind: "any" };

function isAsteroidId(location: AsteroidName): location is AsteroidId {
  return location in asteroids;
}

export function isNebulaId(location: AsteroidName): location is NebulaId {
  return location in nebulaNames;
}

/**
 * 採取地の指定（個別小惑星 / 組成指定 / any / 星雲）を具体的な場所に展開する
 * 組成指定はその組成の小惑星すべて（テーブル順）になる
 */
export function resolveLocation(location: AsteroidName): CollectionSite[] {
  if (isAsteroidId(location)) return [{ kind: "asteroid", id: location }];
  if (isNebulaId(location)) return [{ kind: "nebula", id: location }];
  if (location === "any") return [{ kind: "any" }];
  const composition = compositionByGenericId[location];
  return asteroidIds.filter((id) => asteroids[id].composition === composition).map((id) => ({ kind: "asteroid", id }));
}

/**
 * 組成指定（"metallic-asteroids" など）ならその組成、それ以外なら undefined
 */
export function getGenericComposition(location: AsteroidName): Composition | undefined {
  return location in compositionByGenericId
    ? compositionByGenericId[location as keyof typeof compositionByGenericId]
    : undefined;
}

export function getAsteroidComposition(id: AsteroidId): Composition {
  return asteroids[id].composition;
}

export function getCompositionName(composition: Composition, locale: Locale = "en"): string {
  return compositionNames[composition][locale];
}

export function getAsteroidInfo(
  asteroidId: AsteroidName,
  locale: Locale = "en",
): { name: string; region?: string; compositon?: string } {
  if (isAsteroidId(asteroidId)) {
    const a = asteroids[asteroidId];
    return {
      name: a.name,
      region: regionNames[a.region][locale],
      compositon: compositionNames[a.composition][locale],
    };
  } else {
    return {
      name: genericAsteroidNames[asteroidId][locale],
    };
  }
}

/**
 * depth の地点に最も近いステーション（差が同じなら先に並んでいる方）
 */
function nearestStation(depth: number): RegionId {
  const regions = Object.keys(stationDepths) as RegionId[];
  return regions.reduce((a, b) => (Math.abs(stationDepths[a] - depth) <= Math.abs(stationDepths[b] - depth) ? a : b));
}

/**
 * 星雲 1 か所の位置: depth・最寄りステーションからの方向と距離
 */
export type NebulaLocation = {
  depth: number;
  station: RegionId;
  direction: "left" | "right";
  distanceMm: number;
};

export function getNebulaLocations(id: NebulaId): NebulaLocation[] {
  return nebulaDepths[id].map((depth) => {
    const station = nearestStation(depth);
    const diff = depth - stationDepths[station];
    return {
      depth,
      station,
      direction: diff < 0 ? "left" : "right",
      distanceMm: Math.abs(diff),
    };
  });
}

/**
 * 星雲への行き方の案内。1 か所につき { depth: "Depth: 6,900 Mm", from: "700 Mm left of Noblecore AG Station" } の形で 1 件
 * 1 行で出すか 2 行に分けるかは表示側で決める
 */
export type NebulaGuide = { depth: string; from: string };

export function getNebulaGuides(id: NebulaId, locale: Locale = "en"): NebulaGuide[] {
  return getNebulaLocations(id).map(({ depth, station, direction, distanceMm }) => ({
    depth: `Depth: ${formatNumber(depth)} Mm`,
    from: `${formatNumber(distanceMm)} Mm ${direction} of ${regionNames[station][locale]} Station`,
  }));
}
