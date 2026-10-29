import type { Resident } from "../resident.ts"

const residents = {
  オスカー: {
    map: "phanthiet-fields",
    name: "オスカー",
    job: "小作の農夫",
    at: [9.6, 14.8],
    item: "hoe",
    look: { legs: "straight", footwear: "clogs", top: "cBrown", bottom: "cGreen", vest: "leather", collar: null, sex: "m", skin: "skin2", hair: "hBlack", style: "short", hat: "straw", eye: "cBrown" },
  },
  ヨハンナ: {
    map: "phanthiet-fields",
    name: "ヨハンナ",
    job: "小作の農婦",
    at: [30, 15],
    item: "basket",
    look: { skirt: "mid", footwear: "clogs", top: "cRose", apron: "cLinen", bodice: "cBrown", sex: "f", skin: "skin2", hair: "hBrown", style: "braid", hat: "kerchief", hatRamp: "cRose", eye: "cBlue" },
  },
  ヴァレンティン: {
    map: "phanthiet-fields",
    name: "ヴァレンティン",
    job: "子ども",
    at: [18.2, 26],
    item: null,
    look: { legs: "breeches", footwear: "shoes", hose: "cLinen", shoes: "leatherD", top: "cGreen", bottom: "cBrown", collar: null, sex: "m", age: "child", skin: "skin2", hair: "hBlack", style: "short", eye: "cBrown" },
  },
  エリーゼ: {
    map: "phanthiet-fields",
    name: "エリーゼ",
    job: "子ども",
    at: [19.6, 27.2],
    item: null,
    look: { skirt: "short", footwear: "shoes", hose: "cCream", shoes: "leatherR", top: "cRose", bow: "cCream", sex: "f", age: "child", skin: "skin2", hair: "hBrown", style: "pony", eye: "cBrown" },
  },
} satisfies Record<string, Resident>

export { residents }
