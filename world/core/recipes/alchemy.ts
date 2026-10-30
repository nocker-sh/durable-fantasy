import { recipe as r, type Recipe } from "./definition"

export const ALCHEMY_RECIPES: readonly Recipe[] = [
  // herbs boiled down at the hearth, with jelly to bind them
  r({
    id: "potion",
    skill: "alchemy",
    station: "hearth",
    inputs: [
      ["herb", 3],
      ["jelly", 1],
    ],
    output: ["potion", 2],
  }),
  r({
    id: "blue-potion",
    skill: "alchemy",
    station: "hearth",
    inputs: [
      ["blue-herb", 2],
      ["blue-jelly", 1],
    ],
    output: ["blue-potion", 1],
    min: 4,
  }),
  // the honey baked into the farm's cakes, stirred into the potion
  r({
    id: "orange-potion",
    skill: "alchemy",
    station: "hearth",
    inputs: [
      ["potion", 2],
      ["honey-cake", 1],
      ["firewood", 1],
    ],
    output: ["orange-potion", 1],
    min: 8,
  }),
]
