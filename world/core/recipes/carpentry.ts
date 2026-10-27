import { recipe as r, type Recipe } from "./definition.ts"

export const CARPENTRY_RECIPES: readonly Recipe[] = [
  // the workbench: wood
  r("firewood", "carpentry", "workbench", [["log", 1]], ["firewood", 2]),
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
  // A carved shaft with a crystal fitted at the tip, for both spells and prayers.
  r(
    "oak-staff",
    "carpentry",
    "workbench",
    [
      ["plank", 2],
      ["small-crystal", 1],
    ],
    ["oak-staff", 1],
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
]
