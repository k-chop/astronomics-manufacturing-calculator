export type ItemStack = {
  item: string;
  amount: number;
};

export type RecipeMethod = {
  inputs: ItemStack[];
  amount: number;
  machine: string;
  duration: number; // seconds
};

export type RecipeMap = {
  [itemId: string]: RecipeMethod[];
};

export const recipes: RecipeMap = {
  // Carbonator
  carbon: [
    {
      inputs: [{ item: "biomass", amount: 50 }],
      amount: 10,
      machine: "carbonator",
      duration: 25,
    },
  ],
  polymers: [
    {
      inputs: [{ item: "biomass", amount: 50 }],
      amount: 20,
      machine: "carbonator",
      duration: 25,
    },
    {
      inputs: [{ item: "petroleum", amount: 50 }],
      amount: 15,
      machine: "clarifier",
      duration: 60,
    },
  ],
  graphite: [
    {
      inputs: [{ item: "carbon", amount: 50 }],
      amount: 10,
      machine: "carbonator",
      duration: 25,
    },
    {
      inputs: [
        { item: "diamond", amount: 50 },
        { item: "graphite", amount: 50 },
      ],
      amount: 50,
      machine: "carbonator",
      duration: 25,
    },
  ],
  resin: [
    {
      inputs: [{ item: "biomass", amount: 50 }],
      amount: 15,
      machine: "carbonator",
      duration: 25,
    },
    {
      inputs: [{ item: "petroleum", amount: 50 }],
      amount: 15,
      machine: "clarifier",
      duration: 60,
    },
  ],
  "glass-sheet": [
    {
      inputs: [{ item: "sand", amount: 50 }],
      amount: 25,
      machine: "carbonator",
      duration: 25,
    },
  ],

  // Clarifier
  "purified-water": [
    {
      inputs: [{ item: "brine", amount: 50 }],
      amount: 35,
      machine: "clarifier",
      duration: 60,
    },
    {
      inputs: [{ item: "water", amount: 50 }],
      amount: 40,
      machine: "clarifier",
      duration: 60,
    },
  ],
  salt: [
    {
      inputs: [{ item: "brine", amount: 50 }],
      amount: 10,
      machine: "clarifier",
      duration: 60,
    },
  ],
  biomass: [
    {
      inputs: [{ item: "water", amount: 50 }],
      amount: 5,
      machine: "clarifier",
      duration: 60,
    },
  ],
  diesel: [
    {
      inputs: [{ item: "petroleum", amount: 50 }],
      amount: 35,
      machine: "clarifier",
      duration: 60,
    },
  ],

  // Converter
  plastics: [
    {
      inputs: [
        { item: "resin", amount: 10 },
        { item: "silica", amount: 30 },
      ],
      amount: 40,
      machine: "converter",
      duration: 60,
    },
  ],
  "steel-rods": [
    {
      inputs: [
        { item: "iron", amount: 20 },
        { item: "nickel", amount: 5 },
      ],
      amount: 25,
      machine: "converter",
      duration: 45,
    },
  ],
  "carbon-fiber": [
    {
      inputs: [
        { item: "polymers", amount: 20 },
        { item: "carbon", amount: 20 },
      ],
      amount: 30,
      machine: "converter",
      duration: 60,
    },
  ],
  "copper-wire": [
    {
      inputs: [
        { item: "copper", amount: 30 },
        { item: "iron", amount: 10 },
      ],
      amount: 40,
      machine: "converter",
      duration: 45,
    },
  ],
  hydrogel: [
    {
      inputs: [
        { item: "purified-water", amount: 20 },
        { item: "polymers", amount: 30 },
      ],
      amount: 40,
      machine: "converter",
      duration: 60,
    },
  ],
  "fiber-optic-strands": [
    {
      inputs: [{ item: "gem-dust", amount: 50 }],
      amount: 50,
      machine: "converter",
      duration: 60,
    },
  ],

  // Crusher
  sand: [
    {
      inputs: [{ item: "silica", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
  ],
  "magnetic-dust": [
    {
      inputs: [{ item: "lodestone", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
  ],
  "bauxite-dust": [
    {
      inputs: [{ item: "bauxite", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
  ],
  "gem-dust": [
    {
      inputs: [{ item: "aquamarine", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
    {
      inputs: [{ item: "citrine", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
    {
      inputs: [{ item: "emerald", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
    {
      inputs: [{ item: "opal", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
    {
      inputs: [{ item: "ruby", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
    {
      inputs: [{ item: "sapphire", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
    {
      inputs: [{ item: "topaz", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
    {
      inputs: [{ item: "diamond", amount: 10 }],
      amount: 10,
      machine: "crusher",
      duration: 10,
    },
  ],

  // Computer
  "asteroid-research": [
    {
      inputs: [
        { item: "silicate-asteroid-data", amount: 100 },
        { item: "metallic-asteroid-data", amount: 100 },
        { item: "carbonite-asteroid-data", amount: 100 },
      ],
      amount: 50,
      machine: "computer",
      duration: 120,
    },
  ],
  "combustion-research": [
    {
      inputs: [
        { item: "carbonite-asteroid-data", amount: 200 },
        { item: "diesel", amount: 35 },
      ],
      amount: 100,
      machine: "computer",
      duration: 120,
    },
  ],
  "optics-research": [
    {
      inputs: [
        { item: "silicate-asteroid-data", amount: 200 },
        { item: "glass-sheet", amount: 75 },
      ],
      amount: 100,
      machine: "computer",
      duration: 120,
    },
  ],
  "magnetic-field-research": [
    {
      inputs: [
        { item: "metallic-asteroid-data", amount: 200 },
        { item: "magnetic-dust", amount: 80 },
      ],
      amount: 100,
      machine: "computer",
      duration: 120,
    },
  ],
  "buoyancy-research": [
    {
      inputs: [
        { item: "low-gravity-data", amount: 200 },
        { item: "purified-water", amount: 40 },
      ],
      amount: 100,
      machine: "computer",
      duration: 120,
    },
  ],
  "trajectory-research": [
    {
      inputs: [
        { item: "meteorite-data", amount: 200 },
        { item: "fiber-optic-strands", amount: 60 },
      ],
      amount: 100,
      machine: "computer",
      duration: 120,
    },
  ],
  "conductivity-research": [
    {
      inputs: [
        { item: "electrical-storm-data", amount: 200 },
        { item: "copper-wire", amount: 80 },
      ],
      amount: 100,
      machine: "computer",
      duration: 120,
    },
  ],
  "panspermia-research": [
    {
      inputs: [
        { item: "creature-data", amount: 200 },
        { item: "hydrogel", amount: 20 },
      ],
      amount: 100,
      machine: "computer",
      duration: 120,
    },
  ],
};
