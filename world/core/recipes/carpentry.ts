import { recipe as r, type Recipe } from "./definition"

export const CARPENTRY_RECIPES: readonly Recipe[] = [
  // the workbench: wood
  r({ id: "firewood", skill: "carpentry", station: "workbench", inputs: [["log", 1]], output: ["firewood", 2] }),
  r({ id: "plank", skill: "carpentry", station: "workbench", inputs: [["log", 1]], output: ["plank", 2] }),
  r({ id: "wooden-stick", skill: "carpentry", station: "workbench", inputs: [["plank", 1]], output: ["wooden-stick", 1] }),
  r({
    id: "fishing-rod",
    skill: "carpentry",
    station: "workbench",
    inputs: [
      ["plank", 1],
      ["yarn", 1],
    ],
    output: ["fishing-rod", 1],
    min: 2,
  }),
  r({
    id: "wooden-shield",
    skill: "carpentry",
    station: "workbench",
    inputs: [
      ["plank", 3],
      ["iron-ingot", 1],
    ],
    output: ["wooden-shield", 1],
    min: 4,
  }),
  // A carved shaft with a crystal fitted at the tip, for both spells and prayers.
  r({
    id: "oak-staff",
    skill: "carpentry",
    station: "workbench",
    inputs: [
      ["plank", 2],
      ["small-crystal", 1],
    ],
    output: ["oak-staff", 1],
    min: 4,
  }),
  r({
    id: "short-bow",
    skill: "carpentry",
    station: "workbench",
    inputs: [
      ["plank", 2],
      ["yarn", 2],
    ],
    output: ["short-bow", 1],
    min: 8,
  }),
  r({
    id: "prayer-necklace",
    skill: "carpentry",
    station: "workbench",
    inputs: [
      ["plank", 2],
      ["small-crystal", 2],
      ["yarn", 1],
    ],
    output: ["prayer-necklace", 1],
    min: 8,
  }),
]
