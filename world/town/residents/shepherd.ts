import type { Resident } from "../resident.ts"

const residents = {
  マティアス: {
    name: "マティアス",
    job: "羊飼い",
    at: "pasture",
    item: "staff",
    look: {
      footwear: "wraps",
      top: "cSky",
      bottom: "cCream",
      vest: "wool",
      cape: "cCream",
      trim: "cBlue",
      sex: "m",
      skin: "skin1",
      hair: "hBlond",
      style: "short",
      hat: "hood",
      hatRamp: "cGreen",
      eye: "cBlue",
    },
  },
  レージ: {
    map: "phanthiet",
    name: "レージ",
    job: "羊飼いの手伝い",
    at: [44.2, 40.8],
    item: "staff",
    look: { skirt: "short", footwear: "wraps", hose: "cCream", top: "cCream", cape: "cGreen", sex: "f", age: "child", skin: "skin1", hair: "hBlond", style: "braid", hat: "hood", hatRamp: "cGreen", eye: "cBlue" },
  },
} satisfies Record<string, Resident>

export { residents }
