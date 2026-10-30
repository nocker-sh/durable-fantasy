import { recipe as r, type Recipe } from "./definition"

export const TAILORING_RECIPES: readonly Recipe[] = [
  // the loom and spinning wheel: fleece spun to yarn, woven to a muffler
  r({ id: "yarn", skill: "tailoring", station: "loom", inputs: [["white-fleece", 1]], output: ["yarn", 2] }),
  r({ id: "cloth-hat", skill: "tailoring", station: "loom", inputs: [["yarn", 2]], output: ["cloth-hat", 1], min: 2 }),
  r({
    id: "leather-boots",
    skill: "tailoring",
    station: "loom",
    inputs: [
      ["tanned-leather", 2],
      ["yarn", 1],
    ],
    output: ["leather-boots", 1],
    min: 2,
  }),
  r({ id: "wool-muffler", skill: "tailoring", station: "loom", inputs: [["yarn", 3]], output: ["wool-muffler", 1], min: 2 }),
  r({ id: "striped-muffler", skill: "tailoring", station: "loom", inputs: [["yarn", 4]], output: ["striped-muffler", 1], min: 4 }),
  r({
    id: "fur-stole",
    skill: "tailoring",
    station: "loom",
    inputs: [
      ["soft-fur", 3],
      ["yarn", 2],
    ],
    output: ["fur-stole", 1],
    min: 4,
  }),
  r({
    id: "traveller-coat",
    skill: "tailoring",
    station: "loom",
    inputs: [
      ["yarn", 4],
      ["soft-fur", 1],
    ],
    output: ["traveller-coat", 1],
    min: 4,
  }),
  r({
    id: "leather-armor",
    skill: "tailoring",
    station: "loom",
    inputs: [
      ["tanned-leather", 5],
      ["yarn", 2],
    ],
    output: ["leather-armor", 1],
    min: 8,
  }),
  r({
    id: "wool-cape",
    skill: "tailoring",
    station: "loom",
    inputs: [
      ["yarn", 6],
      ["soft-fur", 1],
    ],
    output: ["wool-cape", 1],
    min: 8,
  }),
  r({
    id: "fang-charm",
    skill: "tailoring",
    station: "loom",
    inputs: [
      ["sharp-fang", 3],
      ["yarn", 1],
    ],
    output: ["fang-charm", 1],
    min: 4,
  }),
]
