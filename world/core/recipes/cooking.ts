import { recipe as r, type Recipe } from "./definition.ts"

export const COOKING_RECIPES: readonly Recipe[] = [
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
]
