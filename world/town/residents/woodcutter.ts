import type { Resident } from "../resident.ts"

const residents = {
  ヨーゼフ: {
    name: "ヨーゼフ",
    job: "木こり",
    at: "chop",
    item: "axe",
    look: {
      footwear: "wraps",
      shoes: "leatherD",
      top: "cMint",
      bottom: "cBrown",
      vest: "leather",
      gloves: "leather",
      sex: "m",
      skin: "skin2",
      hair: "hBrown",
      style: "short",
      hat: "hood",
      hatRamp: "cBrown",
      eye: "cBrown",
    },
  },
} satisfies Record<string, Resident>

export { residents }
