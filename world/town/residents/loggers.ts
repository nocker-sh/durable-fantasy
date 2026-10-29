import type { Resident } from "../resident.ts"

const residents = {
  アンゼルム: {
    map: "forest-edge",
    name: "アンゼルム",
    job: "木こり",
    at: [30, 30],
    item: "axe",
    look: { legs: "straight", footwear: "boots", shoes: "leatherD", top: "cRed", bottom: "cBrown", vest: "leather", gloves: "leatherD", sex: "m", skin: "skin1", hair: "hBrown", style: "short", hat: "cap", hatRamp: "cRed", eye: "cGreen" },
  },
  ルーペルト: {
    map: "forest-edge",
    name: "ルーペルト",
    job: "木こり",
    at: [32.4, 28.6],
    item: "axe",
    look: { legs: "straight", footwear: "boots", shoes: "leatherD", top: "cGreen", bottom: "cBrown", vest: "wool", sex: "m", skin: "skin1", hair: "hBrown", style: "curly", eye: "cGreen" },
  },
  フロリアン: {
    map: "forest-edge",
    name: "フロリアン",
    job: "木こり",
    at: [28.4, 31.6],
    item: "axe",
    look: { legs: "breeches", footwear: "boots", hose: "cGray", shoes: "leatherD", top: "cMustard", bottom: "cBrown", sex: "m", skin: "skin1", hair: "hBrown", style: "pony", eye: "cGreen" },
  },
} satisfies Record<string, Resident>

export { residents }
