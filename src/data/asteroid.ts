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
} as const;

const regionNames = {
  cubecorp: { en: "Cube Corp" },
  medusaminerals: { en: "Medusa Minerals" },
  twgems: { en: "TW Gems" },
  blacktidal: { en: "Black Tidal" },
  ceresvesta: { en: "Ceres Vesta" },
} as const;

const compositionNames = {
  carbonite: { en: "Carbonite" },
  metallic: { en: "Metallic" },
  silicate: { en: "Silicate" },
} as const;

export const genericAsteroidNames = {
  // Generic types
  "carbonite-asteroids": { en: "Carbonite Asteroids" },
  "metallic-asteroids": { en: "Metallic Asteroids" },
  "silicate-asteroids": { en: "Silicate Asteroids" },
  any: { en: "Any Asteroid" },
} satisfies {
  [asteroidId: string]: {
    en: string;
  };
};

export type AsteroidName =
  | keyof typeof asteroids
  | keyof typeof genericAsteroidNames;

export function getAsteroidInfo(
  asteroidId: AsteroidName,
  locale: Locale = "en",
): { name: string; region?: string; compositon?: string } {
  if (asteroidId in asteroids) {
    const a = asteroids[asteroidId as keyof typeof asteroids];
    return {
      name: a.name,
      region: regionNames[a.region][locale],
      compositon: compositionNames[a.composition][locale],
    };
  } else {
    return { name: genericAsteroidNames[asteroidId as keyof typeof genericAsteroidNames][locale] };
  }
}
