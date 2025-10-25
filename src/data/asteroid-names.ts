export type AsteroidNamesMap = {
  [asteroidId: string]: {
    en: string;
  };
};

export const asteroidNames: AsteroidNamesMap = {
  // Generic types
  "carbonite-asteroids": { en: "Carbonite Asteroids" },
  "metallic-asteroids": { en: "Metallic Asteroids" },
  "silicate-asteroids": { en: "Silicate Asteroids" },
  any: { en: "Any Asteroid" },

  // Cube Corp
  cc1: { en: "CC1 - Cube Corp (Carbonite)" },
  cc2: { en: "CC2 - Cube Corp (Silicate)" },
  cc3: { en: "CC3 - Cube Corp (Carbonite)" },
  cc4: { en: "CC4 - Cube Corp (Metallic)" },

  // Medusa Minerals
  mm1: { en: "MM1 - Medusa Minerals (Metallic)" },
  mm2: { en: "MM2 - Medusa Minerals (Carbonite)" },
  mm3: { en: "MM3 - Medusa Minerals (Metallic)" },
  mm4: { en: "MM4 - Medusa Minerals (Silicate)" },

  // TW Gems
  tw1: { en: "TW1 - TW Gems (Carbonite)" },
  tw2: { en: "TW2 - TW Gems (Carbonite)" },
  tw3: { en: "TW3 - TW Gems (Silicate)" },
  tw4: { en: "TW4 - TW Gems (Silicate)" },

  // Black Tidal
  bt1: { en: "BT1 - Black Tidal (Silicate)" },
  bt2: { en: "BT2 - Black Tidal (Metallic)" },
  bt3: { en: "BT3 - Black Tidal (Silicate)" },
  bt4: { en: "BT4 - Black Tidal (Carbonite)" },

  // Ceres Vesta
  cv1: { en: "CV1 - Ceres Vesta (Silicate)" },
  cv2: { en: "CV2 - Ceres Vesta (Carbonite)" },
  cv3: { en: "CV3 - Ceres Vesta (Silicate)" },
  cv4: { en: "CV4 - Ceres Vesta (Metallic)" },
};

/**
 * Get the display name for an asteroid
 */
export function getAsteroidName(asteroidId: string, locale = "en"): string {
  return asteroidNames[asteroidId]?.[locale] ?? asteroidId;
}
