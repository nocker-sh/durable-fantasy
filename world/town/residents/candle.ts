import type { Resident } from "../resident.ts"

const residents = {
  アガーテ: {
    map: "phanthiet-market",
    name: "アガーテ",
    job: "ろうそく屋",
    at: [10, 25.6],
    item: null,
    look: { skirt: "mid", footwear: "clogs", top: "cHoney", apron: "cLinen", bodice: "cWine", frill: true, bow: "cWine", sex: "f", skin: "skin2", hair: "hBlack", style: "bun", eye: "cBrown" },
  },
  ジーモン: {
    map: "phanthiet-market",
    name: "ジーモン",
    job: "油売り",
    at: [13.2, 25.4],
    item: "bucket",
    look: {
      legs: "straight",
      footwear: "boots",
      shoes: "leatherD",
      top: "cMustard",
      bottom: "cBrown",
      vest: "leather",
      cape: "cBrown",
      collar: null,
      sex: "m",
      skin: "skin2",
      hair: "hBlack",
      style: "short",
      eye: "cBrown",
    },
  },
  フェリックス: {
    map: "phanthiet-market",
    name: "フェリックス",
    job: "子ども",
    at: [8.6, 25.8],
    item: null,
    look: {
      legs: "breeches",
      footwear: "shoes",
      hose: "cCream",
      shoes: "leatherD",
      top: "cWine",
      bottom: "cCream",
      vest: "cHoney",
      collar: null,
      sex: "m",
      age: "child",
      skin: "skin2",
      hair: "hBlack",
      style: "short",
      eye: "cBrown",
    },
  },
} satisfies Record<string, Resident>

export { residents }
