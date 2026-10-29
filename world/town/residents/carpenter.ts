import type { Resident } from "../resident.ts"

const residents = {
  フォルカー: {
    map: "phanthiet-craft",
    name: "フォルカー",
    job: "大工",
    at: [39, 22.2],
    item: "hammer",
    look: { legs: "straight", footwear: "boots", shoes: "leatherD", top: "cBlue", bottom: "cBrown", vest: "leather", belt: true, sex: "m", skin: "skin1", hair: "hRed", style: "short", hat: "cap", hatRamp: "cBrown", eye: "cGray" },
  },
  ジビレ: {
    map: "phanthiet-craft",
    name: "ジビレ",
    job: "大工のおかみ",
    at: [42, 21.8],
    item: null,
    look: { skirt: "mid", footwear: "clogs", top: "cGreen", apron: "cLinen", bodice: "cMustard", sex: "f", skin: "skin2", hair: "hBrown", style: "braid", eye: "cGray" },
  },
  ウルリヒ: {
    map: "phanthiet-craft",
    name: "ウルリヒ",
    job: "大工の見習い",
    at: [37.6, 24.6],
    item: "hammer",
    look: { legs: "breeches", footwear: "boots", hose: "cGray", shoes: "leatherD", top: "cSky", bottom: "cBrown", sex: "m", skin: "skin1", hair: "hRed", style: "curly", eye: "cGray" },
  },
  パウリーネ: {
    map: "phanthiet-craft",
    name: "パウリーネ",
    job: "子ども",
    at: [40.8, 24.8],
    item: null,
    look: { skirt: "short", footwear: "clogs", hose: "cMustard", top: "cMustard", bow: "cGreen", sex: "f", age: "child", skin: "skin2", hair: "hRed", style: "pony", eye: "cGray" },
  },
} satisfies Record<string, Resident>

export { residents }
