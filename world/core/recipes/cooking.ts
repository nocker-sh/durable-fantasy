import { recipe as r, type Recipe } from "#/world/core/recipes/definition"

export const COOKING_RECIPES: readonly Recipe[] = [
  // cooking at the hearth: firewood for the fire, what grows and swims for the pot
  r({
    id: "cabbage-soup",
    skill: "cooking",
    station: "hearth",
    inputs: [
      ["cabbage", 1],
      ["onion", 1],
      ["firewood", 1],
    ],
    output: ["cabbage-soup", 2],
  }),
  r({
    id: "mushroom-soup",
    skill: "cooking",
    station: "hearth",
    inputs: [
      ["mushroom", 2],
      ["onion", 1],
      ["firewood", 1],
    ],
    output: ["mushroom-soup", 2],
    min: 2,
  }),
  r({
    id: "fish-soup",
    skill: "cooking",
    station: "hearth",
    inputs: [
      ["sea-fish", 2],
      ["onion", 1],
      ["firewood", 1],
    ],
    output: ["fish-soup", 2],
    min: 2,
  }),
  r({
    id: "skewer",
    skill: "cooking",
    station: "hearth",
    inputs: [
      ["trout", 1],
      ["charcoal", 1],
    ],
    output: ["skewer", 2],
  }),
  r({
    id: "smoked-fish",
    skill: "cooking",
    station: "hearth",
    inputs: [
      ["sea-fish", 2],
      ["firewood", 1],
    ],
    output: ["smoked-fish", 2],
  }),
  r({
    id: "herb-tea",
    skill: "cooking",
    station: "hearth",
    inputs: [
      ["herb", 2],
      ["firewood", 1],
    ],
    output: ["herb-tea", 2],
  }),
  r({
    id: "stew",
    skill: "cooking",
    station: "hearth",
    inputs: [
      ["hot-milk", 1],
      ["carrot", 1],
      ["turnip", 1],
      ["firewood", 1],
    ],
    output: ["stew", 2],
    min: 4,
  }),
  r({
    id: "mushroom-stew",
    skill: "cooking",
    station: "hearth",
    inputs: [
      ["mushroom", 2],
      ["turnip", 1],
      ["rye-bread", 1],
      ["firewood", 1],
    ],
    output: ["mushroom-stew", 2],
    min: 8,
  }),
]
