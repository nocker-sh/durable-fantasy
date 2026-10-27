import { recipe as r, type Recipe } from "./definition.ts"

export const SMITHING_RECIPES: readonly Recipe[] = [
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
    "iron-helm",
    "smithing",
    "forge",
    [
      ["iron-ingot", 2],
      ["tanned-leather", 1],
    ],
    ["iron-helm", 1],
    4,
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
    "short-sword",
    "smithing",
    "forge",
    [
      ["iron-ingot", 2],
      ["plank", 1],
      ["tanned-leather", 1],
    ],
    ["short-sword", 1],
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
  r(
    "hand-axe",
    "smithing",
    "forge",
    [
      ["iron-ingot", 2],
      ["plank", 1],
    ],
    ["hand-axe", 1],
    4,
  ),
  r(
    "spear",
    "smithing",
    "forge",
    [
      ["iron-ingot", 3],
      ["plank", 2],
      ["yarn", 1],
    ],
    ["spear", 1],
    8,
  ),
  r(
    "mace",
    "smithing",
    "forge",
    [
      ["iron-ingot", 4],
      ["plank", 1],
    ],
    ["mace", 1],
    8,
  ),
]
