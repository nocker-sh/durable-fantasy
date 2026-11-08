import { recipe as r, type Recipe } from "#/world/core/recipes/definition"
import { FORGED_WEAPON_RECIPES } from "#/world/core/recipes/forged-weapons"

export const SMITHING_RECIPES: readonly Recipe[] = [
  // the forge: scrap to iron, iron and wood to tools
  r({
    id: "iron-ingot",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["rusty-scrap", 2],
      ["charcoal", 1],
    ],
    output: ["iron-ingot", 1],
  }),
  r({
    id: "wood-axe",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 1],
      ["plank", 1],
    ],
    output: ["wood-axe", 1],
    min: 2,
  }),
  r({
    id: "sickle",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 1],
      ["plank", 1],
    ],
    output: ["sickle", 1],
    min: 2,
  }),
  r({
    id: "iron-helm",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 2],
      ["tanned-leather", 1],
    ],
    output: ["iron-helm", 1],
    min: 4,
  }),
  r({
    id: "chain-mail",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 6],
      ["tanned-leather", 1],
    ],
    output: ["chain-mail", 1],
    min: 8,
  }),
  r({
    id: "dagger",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 2],
      ["soft-fur", 1],
    ],
    output: ["dagger", 1],
    min: 4,
  }),
  r({
    id: "short-sword",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 2],
      ["plank", 1],
      ["tanned-leather", 1],
    ],
    output: ["short-sword", 1],
    min: 4,
  }),
  r({
    id: "iron-sword",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 3],
      ["plank", 1],
      ["soft-fur", 1],
    ],
    output: ["iron-sword", 1],
    min: 8,
  }),
  r({
    id: "hand-axe",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 2],
      ["plank", 1],
    ],
    output: ["hand-axe", 1],
    min: 4,
  }),
  r({
    id: "battle-axe",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 6],
      ["plank", 2],
      ["tanned-leather", 2],
    ],
    output: ["battle-axe", 1],
    min: 8,
  }),
  r({
    id: "spear",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 3],
      ["plank", 2],
      ["yarn", 1],
    ],
    output: ["spear", 1],
    min: 8,
  }),
  r({
    id: "mace",
    skill: "smithing",
    station: "forge",
    inputs: [
      ["iron-ingot", 4],
      ["plank", 1],
    ],
    output: ["mace", 1],
    min: 8,
  }),
  ...FORGED_WEAPON_RECIPES,
]
