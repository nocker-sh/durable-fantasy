import type { Resident } from "../resident.ts"

const residents = {
  ゲルダ: {
    name: "ゲルダ",
    job: "宿屋のおかみ",
    at: "innFront",
    item: null,
    look: {
      overskirt: "cRed",
      footwear: "shoes",
      shoes: "leatherD",
      top: "cWine",
      bodice: "cBrown",
      apron: "cCream",
      frill: true,
      trim: "cBrown",
      sex: "f",
      skin: "skin1",
      hair: "hRed",
      style: "bun",
      eye: "cGreen",
    },
  },
  ゼップ: {
    map: "phanthiet-in-inn",
    name: "ゼップ",
    job: "宿の料理番",
    at: [22.25, 21.75],
    item: null,
    look: { legs: "straight", footwear: "clogs", top: "cCream", bottom: "cBrown", apron: "cCream", collar: null, sex: "m", skin: "skin2", hair: "hBlack", style: "bald", eye: "cBrown" },
  },
  ニーナ: {
    name: "ニーナ",
    job: "宿の給仕",
    at: "innFront",
    item: null,
    look: {
      skirt: "mid",
      footwear: "shoes",
      shoes: "leatherD",
      top: "cRose",
      bodice: "cWine",
      apron: "cCream",
      frill: true,
      bow: "cRose",
      trim: "cWine",
      sex: "f",
      skin: "skin1",
      hair: "hRed",
      style: "pony",
      eye: "cGreen",
    },
  },
} satisfies Record<string, Resident>

export { residents }
