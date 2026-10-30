import type { Resident } from "../resident"

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
} satisfies Record<string, Resident>

export { residents }
