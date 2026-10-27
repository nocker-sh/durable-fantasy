import { recipe as r, type Recipe } from "./definition.ts"

export const TAILORING_RECIPES: readonly Recipe[] = [
  // the loom and spinning wheel: fleece spun to yarn, woven to a muffler
  r("yarn", "tailoring", "loom", [["white-fleece", 1]], ["yarn", 2]),
  r("cloth-hat", "tailoring", "loom", [["yarn", 2]], ["cloth-hat", 1], 2),
  r("wool-muffler", "tailoring", "loom", [["yarn", 3]], ["wool-muffler", 1], 2),
  r("striped-muffler", "tailoring", "loom", [["yarn", 4]], ["striped-muffler", 1], 4),
  r(
    "wool-cape",
    "tailoring",
    "loom",
    [
      ["yarn", 6],
      ["soft-fur", 1],
    ],
    ["wool-cape", 1],
    8,
  ),
  r(
    "fang-charm",
    "tailoring",
    "loom",
    [
      ["sharp-fang", 3],
      ["yarn", 1],
    ],
    ["fang-charm", 1],
    4,
  ),
]
