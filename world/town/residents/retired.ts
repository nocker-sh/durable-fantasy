import type { Resident } from "../resident"

const residents = {
  エドガー: {
    map: "phanthiet-gate",
    name: "エドガー",
    job: "元門番",
    at: [28, 33.6],
    item: "staff",
    look: {
      legs: "straight",
      footwear: "boots",
      shoes: "leatherD",
      top: "cGray",
      bottom: "cBlue",
      cape: "cBlue",
      collar: "cCream",
      sex: "m",
      age: "old",
      skin: "skin1",
      hair: "hGray",
      style: "short",
      eye: "cGray",
    },
  },
  マルグリット: {
    map: "phanthiet-gate",
    name: "マルグリット",
    job: "編み物",
    at: [28, 36.6],
    item: null,
    look: {
      skirt: "long",
      footwear: "shoes",
      shoes: "leatherD",
      top: "cLilac",
      apron: "cCream",
      cape: "cRose",
      bow: "cRose",
      sex: "f",
      age: "old",
      skin: "skin1",
      hair: "hGray",
      style: "bun",
      eye: "cBlue",
    },
  },
} satisfies Record<string, Resident>

export { residents }
