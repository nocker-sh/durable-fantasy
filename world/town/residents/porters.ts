import type { Resident } from "../resident.ts"

const residents = {
  インゴ: {
    map: "phanthiet-gate",
    name: "インゴ",
    job: "荷担ぎ",
    at: [31.6, 16.6],
    item: "sack",
    look: { legs: "straight", footwear: "boots", shoes: "leatherD", top: "cBrown", bottom: "cGreen", vest: "leather", sex: "m", skin: "skin2", hair: "hBlond", style: "short", eye: "cBlue" },
  },
  カルラ: {
    map: "phanthiet-gate",
    name: "カルラ",
    job: "倉庫の手伝い",
    at: [29.6, 16.2],
    item: null,
    look: { skirt: "mid", footwear: "shoes", shoes: "leatherK", top: "cMint", apron: "cLinen", sex: "f", skin: "skin1", hair: "hBlack", style: "bob", eye: "cGray" },
  },
  ベルント: {
    map: "phanthiet-gate",
    name: "ベルント",
    job: "荷担ぎ",
    at: [33.2, 16.8],
    item: "sack",
    look: { legs: "breeches", footwear: "boots", hose: "cGreen", shoes: "leatherD", top: "cHoney", bottom: "cGreen", sex: "m", skin: "skin2", hair: "hBlond", style: "curly", eye: "cBlue" },
  },
} satisfies Record<string, Resident>

export { residents }
