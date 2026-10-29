import type { Resident } from "../resident.ts"

const residents = {
  クーノ: {
    map: "phanthiet",
    name: "クーノ",
    job: "川漁師",
    at: [30, 38],
    item: null,
    look: { legs: "straight", footwear: "boots", shoes: "leatherK", top: "cSky", bottom: "cGray", vest: "cBlue", sex: "m", skin: "skin3", hair: "hBrown", style: "short", hat: "hood", hatRamp: "cBlue", eye: "cBlue" },
  },
  テーダ: {
    map: "phanthiet",
    name: "テーダ",
    job: "網繕い",
    at: [25.4, 44.8],
    item: null,
    look: { skirt: "mid", footwear: "clogs", top: "cBlue", apron: "cGray", sex: "f", skin: "skin2", hair: "hBlack", style: "long", hat: "kerchief", hatRamp: "cSky", eye: "cBlue" },
  },
  モーリッツ: {
    map: "phanthiet",
    name: "モーリッツ",
    job: "子ども",
    at: [29.6, 40.2],
    item: null,
    look: { legs: "breeches", footwear: "wraps", hose: "cGray", top: "cBlue", bottom: "cGray", collar: null, sex: "m", age: "child", skin: "skin3", hair: "hBrown", style: "curly", eye: "cBlue" },
  },
} satisfies Record<string, Resident>

export { residents }
