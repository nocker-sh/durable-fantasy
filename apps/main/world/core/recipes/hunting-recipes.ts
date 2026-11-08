import { recipe } from "#/world/core/recipes/definition"
import type { Recipe } from "#/world/core/recipes/definition"

export const HUNTING_RECIPES: readonly Recipe[] = [
  recipe({
    id: "reinforced-sword",
    skill: "smithing",
    station: "forge",
    min: 8,
    inputs: [
      ["iron-sword", 1],
      ["hardened-scrap", 4],
      ["charcoal", 2],
    ],
    output: ["reinforced-sword", 1],
  }),
  recipe({
    id: "tempered-sword",
    skill: "smithing",
    station: "forge",
    min: 8,
    inputs: [
      ["reinforced-sword", 1],
      ["hardened-scrap", 6],
      ["root-resin", 4],
    ],
    output: ["tempered-sword", 1],
  }),
  recipe({
    id: "resin-staff",
    skill: "carpentry",
    station: "workbench",
    min: 8,
    inputs: [
      ["oak-staff", 1],
      ["root-resin", 4],
      ["plank", 2],
    ],
    output: ["resin-staff", 1],
  }),
  recipe({
    id: "root-staff",
    skill: "carpentry",
    station: "workbench",
    min: 8,
    inputs: [
      ["resin-staff", 1],
      ["root-resin", 8],
      ["plank", 4],
    ],
    output: ["root-staff", 1],
  }),
  recipe({
    id: "forest-draught",
    skill: "alchemy",
    station: "hearth",
    min: 8,
    inputs: [
      ["dense-jelly", 1],
      ["herb", 3],
      ["blue-herb", 2],
    ],
    output: ["forest-draught", 1],
  }),
]
