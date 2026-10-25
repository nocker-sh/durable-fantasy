import type { Resident } from "../resident.ts"

const residents = {
  イルムガルト: {
    map: "phanthiet-market",
    name: "イルムガルト",
    job: "薬師",
    at: "apothecary",
    item: null,
    look: {
      skirt: "long",
      footwear: "shoes",
      shoes: "leatherD",
      top: "cMint",
      apron: "cLinen",
      bodice: "cGreen",
      frill: false,
      trim: "cGreen",
      sex: "f",
      age: "old",
      skin: "skin1",
      hair: "hGray",
      style: "bun",
      eye: "cGreen",
    },
  },
  エーファ: {
    map: "phanthiet-market",
    name: "エーファ",
    job: "薬師の弟子",
    at: "apothecary",
    item: null,
    look: {
      skirt: "long",
      footwear: "shoes",
      shoes: "leatherD",
      top: "cSky",
      apron: "cLinen",
      bodice: "cGreen",
      frill: false,
      trim: "cGreen",
      sex: "f",
      skin: "skin1",
      hair: "hBlond",
      style: "braid",
      eye: "cGreen",
    },
  },
} satisfies Record<string, Resident>

export { residents }
