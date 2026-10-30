import type { Resident } from "../resident"

const residents = {
  ハインリヒ: {
    map: "phanthiet-craft",
    name: "ハインリヒ",
    job: "陶工",
    at: [31.4, 22.1],
    item: null,
    look: { legs: "tucked", footwear: "clogs", top: "cLinen", bottom: "cBrown", apron: "cGray", collar: null, sex: "m", skin: "skin2", hair: "hBrown", style: "short", eye: "cBrown" },
  },
  テレーゼ: {
    map: "phanthiet-craft",
    name: "テレーゼ",
    job: "絵付け",
    at: [34.2, 22.1],
    item: null,
    look: {
      skirt: "mid",
      footwear: "shoes",
      shoes: "leatherR",
      top: "cSky",
      apron: "cGray",
      bodice: "cBlue",
      frill: true,
      bow: "cSky",
      sex: "f",
      skin: "skin2",
      hair: "hBrown",
      style: "bun",
      eye: "cBrown",
    },
  },
  アデーレ: {
    map: "phanthiet-craft",
    name: "アデーレ",
    job: "器売り",
    at: [30, 22.3],
    item: "basket",
    look: {
      skirt: "mid",
      footwear: "shoes",
      hose: "cCream",
      shoes: "leatherR",
      top: "cMint",
      bodice: "cBlue",
      frill: true,
      bow: "cBlue",
      trim: "cBlue",
      sex: "f",
      skin: "skin2",
      hair: "hBrown",
      style: "long",
      eye: "cBrown",
    },
  },
} satisfies Record<string, Resident>

export { residents }
