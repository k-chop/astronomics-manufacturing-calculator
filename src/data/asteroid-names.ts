import type { Locale } from "./item-names";

export const asteroidNames = {
  // Generic types
  "carbonite-asteroids": { en: "Carbonite Asteroids" },
  "metallic-asteroids": { en: "Metallic Asteroids" },
  "silicate-asteroids": { en: "Silicate Asteroids" },
  any: { en: "Any Asteroid" },

  // Cube Corp
  CC1: { en: "CC1 - Cube Corp (Carbonite)" },
  CC2: { en: "CC2 - Cube Corp (Silicate)" },
  CC3: { en: "CC3 - Cube Corp (Carbonite)" },
  CC4: { en: "CC4 - Cube Corp (Metallic)" },

  // Medusa Minerals
  MM1: { en: "MM1 - Medusa Minerals (Metallic)" },
  MM2: { en: "MM2 - Medusa Minerals (Carbonite)" },
  MM3: { en: "MM3 - Medusa Minerals (Metallic)" },
  MM4: { en: "MM4 - Medusa Minerals (Silicate)" },

  // TW Gems
  TW1: { en: "TW1 - TW Gems (Carbonite)" },
  TW2: { en: "TW2 - TW Gems (Carbonite)" },
  TW3: { en: "TW3 - TW Gems (Silicate)" },
  TW4: { en: "TW4 - TW Gems (Silicate)" },

  // Black Tidal
  BT1: { en: "BT1 - Black Tidal (Silicate)" },
  BT2: { en: "BT2 - Black Tidal (Metallic)" },
  BT3: { en: "BT3 - Black Tidal (Silicate)" },
  BT4: { en: "BT4 - Black Tidal (Carbonite)" },

  // Ceres Vesta
  CV1: { en: "CV1 - Ceres Vesta (Silicate)" },
  CV2: { en: "CV2 - Ceres Vesta (Carbonite)" },
  CV3: { en: "CV3 - Ceres Vesta (Silicate)" },
  CV4: { en: "CV4 - Ceres Vesta (Metallic)" },
} satisfies {
  [asteroidId: string]: {
    en: string;
  };
};

export type AsteroidName = keyof typeof asteroidNames;

export function getAsteroidName(
  asteroidId: AsteroidName,
  locale: Locale = "en",
): string {
  return asteroidNames[asteroidId]?.[locale] ?? asteroidId;
}
