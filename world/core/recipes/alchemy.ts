import { recipe as r, type Recipe } from "./definition.ts"

export const ALCHEMY_RECIPES: readonly Recipe[] = [
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
]
