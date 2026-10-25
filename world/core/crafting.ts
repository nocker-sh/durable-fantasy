// Making things (economy.md §2): recipes at the town's shared stations — the hearth, workbench and
// loom in the craftsmen's workshop, the shared forge in its yard. A thing worth having needs more
// than one trade: an axe takes the smith's iron and the woodworker's plank. Using a station costs a
// small fee (money leaves the economy), a go costs stamina, and the quality of what comes out
// follows your proficiency and what you put in. Pure: the server rolls the dice.
import { QUALITY_EFFECT, type CraftSkill, type ItemId, type Quality } from "./items.ts";
import { lifeLift } from "./life.ts";

export type StationKind = "hearth" | "workbench" | "loom" | "forge";

export interface Station {
  id: string;
  kind: StationKind;
  name: string;
  map: string;
  cell: readonly [number, number];
  /** what a go costs, paid to the town's 寄り合い */
  fee: number;
}

export interface Recipe {
  id: string;
  skill: CraftSkill;
  station: StationKind;
  inputs: readonly { item: ItemId; count: number }[];
  output: { item: ItemId; count: number };
  /** the skill's level needed to try it (a milestone: 0, 2, 4, 8) */
  min: number;
}

export type StationRule = Omit<Station, "map" | "cell">;

/** The stations and what a go at each costs. Where each stands is the town's (town/stations.ts). */
export const STATION_RULES: readonly StationRule[] = [
  { id: "workshop-hearth", kind: "hearth", name: "共同のかまど", fee: 1 },
  { id: "workshop-bench", kind: "workbench", name: "共同の作業台", fee: 2 },
  { id: "workshop-loom", kind: "loom", name: "共同の機織り機と糸車", fee: 2 },
  { id: "craft-forge", kind: "forge", name: "共同の炉", fee: 4 },
];
export const stationOf = (id: string) => STATION_RULES.find((x) => x.id === id);

const r = (id: string, skill: CraftSkill, station: StationKind, inputs: [ItemId, number][], output: [ItemId, number], min = 0): Recipe => ({
  id,
  skill,
  station,
  inputs: inputs.map(([item, count]) => ({ item, count })),
  output: { item: output[0], count: output[1] },
  min,
});

export const RECIPES: readonly Recipe[] = [
  // cooking at the hearth: firewood for the fire, what grows and swims for the pot
  r(
    "cabbage-soup",
    "cooking",
    "hearth",
    [
      ["cabbage", 1],
      ["onion", 1],
      ["firewood", 1],
    ],
    ["cabbage-soup", 2],
  ),
  r(
    "mushroom-soup",
    "cooking",
    "hearth",
    [
      ["mushroom", 2],
      ["onion", 1],
      ["firewood", 1],
    ],
    ["mushroom-soup", 2],
    2,
  ),
  r(
    "fish-soup",
    "cooking",
    "hearth",
    [
      ["sea-fish", 2],
      ["onion", 1],
      ["firewood", 1],
    ],
    ["fish-soup", 2],
    2,
  ),
  r(
    "skewer",
    "cooking",
    "hearth",
    [
      ["trout", 1],
      ["charcoal", 1],
    ],
    ["skewer", 2],
  ),
  r(
    "smoked-fish",
    "cooking",
    "hearth",
    [
      ["sea-fish", 2],
      ["firewood", 1],
    ],
    ["smoked-fish", 2],
  ),
  r(
    "herb-tea",
    "cooking",
    "hearth",
    [
      ["herb", 2],
      ["firewood", 1],
    ],
    ["herb-tea", 2],
  ),
  r(
    "stew",
    "cooking",
    "hearth",
    [
      ["hot-milk", 1],
      ["carrot", 1],
      ["turnip", 1],
      ["firewood", 1],
    ],
    ["stew", 2],
    4,
  ),
  r(
    "mushroom-stew",
    "cooking",
    "hearth",
    [
      ["mushroom", 2],
      ["turnip", 1],
      ["rye-bread", 1],
      ["firewood", 1],
    ],
    ["mushroom-stew", 2],
    8,
  ),
  // herbs boiled down at the hearth, with jelly to bind them
  r(
    "potion",
    "alchemy",
    "hearth",
    [
      ["herb", 3],
      ["jelly", 1],
    ],
    ["potion", 2],
  ),
  r(
    "blue-potion",
    "alchemy",
    "hearth",
    [
      ["blue-herb", 2],
      ["blue-jelly", 1],
    ],
    ["blue-potion", 1],
    4,
  ),
  // the honey baked into the farm's cakes, stirred into the potion
  r(
    "orange-potion",
    "alchemy",
    "hearth",
    [
      ["potion", 2],
      ["honey-cake", 1],
      ["firewood", 1],
    ],
    ["orange-potion", 1],
    8,
  ),
  // the workbench: wood
  r("plank", "carpentry", "workbench", [["log", 1]], ["plank", 2]),
  r("wooden-stick", "carpentry", "workbench", [["plank", 1]], ["wooden-stick", 1]),
  r(
    "fishing-rod",
    "carpentry",
    "workbench",
    [
      ["plank", 1],
      ["yarn", 1],
    ],
    ["fishing-rod", 1],
    2,
  ),
  r(
    "wooden-shield",
    "carpentry",
    "workbench",
    [
      ["plank", 3],
      ["iron-ingot", 1],
    ],
    ["wooden-shield", 1],
    4,
  ),
  r(
    "short-bow",
    "carpentry",
    "workbench",
    [
      ["plank", 2],
      ["yarn", 2],
    ],
    ["short-bow", 1],
    8,
  ),
  // the loom and spinning wheel: fleece spun to yarn, woven to a muffler
  r("yarn", "tailoring", "loom", [["white-fleece", 1]], ["yarn", 2]),
  r("wool-muffler", "tailoring", "loom", [["yarn", 3]], ["wool-muffler", 1], 2),
  r("striped-muffler", "tailoring", "loom", [["yarn", 4]], ["striped-muffler", 1], 4),
  r(
    "wool-cape",
    "tailoring",
    "loom",
    [
      ["yarn", 6],
      ["soft-fur", 1],
    ],
    ["wool-cape", 1],
    8,
  ),
  // the forge: scrap to iron, iron and wood to tools
  r(
    "iron-ingot",
    "smithing",
    "forge",
    [
      ["rusty-scrap", 2],
      ["charcoal", 1],
    ],
    ["iron-ingot", 1],
  ),
  r(
    "wood-axe",
    "smithing",
    "forge",
    [
      ["iron-ingot", 1],
      ["plank", 1],
    ],
    ["wood-axe", 1],
    2,
  ),
  r(
    "sickle",
    "smithing",
    "forge",
    [
      ["iron-ingot", 1],
      ["plank", 1],
    ],
    ["sickle", 1],
    2,
  ),
  r(
    "dagger",
    "smithing",
    "forge",
    [
      ["iron-ingot", 2],
      ["soft-fur", 1],
    ],
    ["dagger", 1],
    4,
  ),
  r(
    "iron-sword",
    "smithing",
    "forge",
    [
      ["iron-ingot", 3],
      ["plank", 1],
      ["soft-fur", 1],
    ],
    ["iron-sword", 1],
    8,
  ),
  // past level 8 (economy.md §2.1): not to be made in v0.1, where life skills stop at 8
  r(
    "smoked-char",
    "cooking",
    "hearth",
    [
      ["winter-char", 2],
      ["charcoal", 1],
    ],
    ["smoked-char", 2],
    16,
  ),
  r(
    "feast-stew",
    "cooking",
    "hearth",
    [
      ["winter-char", 2],
      ["frost-lily", 1],
      ["hot-milk", 2],
      ["cabbage", 1],
      ["firewood", 2],
    ],
    ["feast-stew", 4],
    32,
  ),
  r(
    "festival-cake",
    "cooking",
    "hearth",
    [
      ["root-dew", 1],
      ["honey-cake", 2],
      ["apple", 4],
      ["firewood", 1],
    ],
    ["festival-cake", 4],
    64,
  ),
  r(
    "frost-potion",
    "alchemy",
    "hearth",
    [
      ["frost-lily", 2],
      ["blue-herb", 2],
      ["blue-jelly", 1],
    ],
    ["frost-potion", 2],
    16,
  ),
  r(
    "moss-oil",
    "alchemy",
    "hearth",
    [
      ["crystal-moss", 2],
      ["frost-lily", 1],
      ["blue-potion", 1],
    ],
    ["moss-oil", 2],
    32,
  ),
  r(
    "root-elixir",
    "alchemy",
    "hearth",
    [
      ["root-dew", 1],
      ["crystal-moss", 2],
      ["frost-potion", 2],
    ],
    ["root-elixir", 2],
    64,
  ),
  r(
    "black-oak-bow",
    "carpentry",
    "workbench",
    [
      ["black-oak-heart", 2],
      ["yarn", 2],
    ],
    ["black-oak-bow", 1],
    16,
  ),
  r(
    "amber-staff",
    "carpentry",
    "workbench",
    [
      ["black-oak-heart", 1],
      ["amber-resin", 2],
      ["small-crystal", 1],
    ],
    ["amber-staff", 1],
    32,
  ),
  r(
    "world-branch-staff",
    "carpentry",
    "workbench",
    [
      ["world-branch", 1],
      ["amber-resin", 1],
      ["clear-crystal", 1],
    ],
    ["world-branch-staff", 1],
    64,
  ),
  r(
    "steel-axe",
    "smithing",
    "forge",
    [
      ["iron-ingot", 4],
      ["black-oak-heart", 1],
      ["charcoal", 2],
    ],
    ["steel-axe", 1],
    16,
  ),
  r(
    "engine-steel-sword",
    "smithing",
    "forge",
    [
      ["engine-core", 2],
      ["iron-ingot", 2],
      ["black-oak-heart", 1],
      ["charcoal", 2],
    ],
    ["engine-steel-sword", 1],
    32,
  ),
  r(
    "reforged-blade",
    "smithing",
    "forge",
    [
      ["engine-core", 3],
      ["amber-resin", 1],
      ["small-crystal", 2],
      ["charcoal", 3],
    ],
    ["reforged-blade", 1],
    64,
  ),
  r(
    "lined-coat",
    "tailoring",
    "loom",
    [
      ["yarn", 6],
      ["soft-fur", 6],
    ],
    ["lined-coat", 1],
    16,
  ),
  r(
    "frost-shawl",
    "tailoring",
    "loom",
    [
      ["yarn", 6],
      ["frost-lily", 3],
      ["amber-resin", 1],
    ],
    ["frost-shawl", 1],
    32,
  ),
  r(
    "woven-muffler",
    "tailoring",
    "loom",
    [
      ["yarn", 10],
      ["elder-scale", 1],
    ],
    ["woven-muffler", 1],
    64,
  ),
];

export const recipeOf = (id: string) => RECIPES.find((x) => x.id === id);

/** A hand new to a recipe spoils some of what it tries (the materials are lost): three in ten at its level, one fewer a level. */
export const failChance = (level: number, min: number) => Math.max(0, 0.3 - (level - min) * 0.1);
export const STAMINA_PER_CRAFT = 1;

/**
 * The quality of what comes out: the roll against chances that rise with the skill's level and
 * with the quality of what went in (an average of the made inputs, 1 when none were made).
 */
export function craftedQuality(level: number, inputQuality: number, roll: number): Quality {
  const lift = lifeLift(level) + (inputQuality - 1) * 0.15;
  const pTop = Math.max(0, lift - 0.55) * 0.5; // 極
  const pHigh = Math.min(0.5, Math.max(0, lift * 0.45)); // 上
  const pLow = Math.max(0.05, 0.45 - lift * 0.6); // 並
  if (roll < pTop) return 3;
  if (roll < pTop + pHigh) return 2;
  if (roll > 1 - pLow) return 0;
  return 1;
}

/** How much a made input counts towards quality. */
export const qualityWeight = (q: Quality | undefined) => (q === undefined ? 1 : QUALITY_EFFECT[q] >= 1.2 ? (q === 3 ? 3 : 2) : q === 0 ? 0 : 1);
