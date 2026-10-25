import type { Resident } from "../resident.ts"

const residents = {
  ルドルフ: {
    map: "phanthiet-craft",
    name: "ルドルフ",
    job: "革職人",
    at: "leatherworker",
    item: null,
    look: {
      legs: "breeches",
      footwear: "boots",
      hose: "cBrown",
      shoes: "leatherR",
      top: "cCream",
      bottom: "cBrown",
      apron: "leather",
      collar: null,
      sex: "m",
      age: "old",
      skin: "skin2",
      hair: "hGray",
      style: "bald",
      eye: "cBlue",
    },
  },
} satisfies Record<string, Resident>

export { residents }
