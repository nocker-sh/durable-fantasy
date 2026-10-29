import type { Resident } from "../resident.ts"

const residents = {
  グスタフ: {
    map: "phanthiet",
    name: "グスタフ",
    job: "道掃き",
    at: [23, 25.4],
    item: "broom",
    look: { legs: "straight", footwear: "wraps", top: "cGray", bottom: "cBrown", cape: "cGray", sex: "m", age: "old", skin: "skin2", hair: "hGray", style: "short", hat: "cap", hatRamp: "cGray", eye: "cBrown" },
  },
  ヴィルマ: {
    map: "phanthiet",
    name: "ヴィルマ",
    job: "道掃き",
    at: [16.4, 30],
    item: "broom",
    look: { skirt: "long", footwear: "wraps", top: "cBrown", apron: "cGray", sex: "f", age: "old", skin: "skin1", hair: "hGray", style: "bun", hat: "kerchief", hatRamp: "cBrown", eye: "cBlue" },
  },
  エリアス: {
    map: "phanthiet",
    name: "エリアス",
    job: "子ども",
    at: [15.2, 33.2],
    item: "broom",
    look: { legs: "breeches", footwear: "clogs", hose: "cBrown", top: "cMustard", bottom: "cBrown", sex: "m", age: "child", skin: "skin2", hair: "hBrown", style: "short", eye: "cBlue" },
  },
} satisfies Record<string, Resident>

export { residents }
