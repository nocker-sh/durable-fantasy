import type { Resident } from "../resident.ts"

const residents = {
  アルブレヒト: {
    map: "phanthiet-fields",
    name: "アルブレヒト",
    job: "肉屋",
    at: [38.6, 22.8],
    item: "sack",
    look: { legs: "straight", footwear: "boots", top: "cWine", bottom: "cGray", apron: "leather", gloves: "leatherD", sex: "m", skin: "skin1", hair: "hBlack", style: "short", eye: "cBlue" },
  },
  ギーゼラ: {
    map: "phanthiet-fields",
    name: "ギーゼラ",
    job: "肉屋のおかみ",
    at: [36.8, 21.6],
    item: null,
    look: { skirt: "mid", footwear: "clogs", top: "cGray", apron: "cLinen", bodice: "cRed", sex: "f", skin: "skin1", hair: "hBrown", style: "bob", hat: "kerchief", hatRamp: "cWine", eye: "cBlue" },
  },
  バスティアン: {
    map: "phanthiet-fields",
    name: "バスティアン",
    job: "豚飼いの子",
    at: [41, 25],
    item: "staff",
    look: { legs: "breeches", footwear: "clogs", hose: "cGray", top: "cHoney", bottom: "cGray", collar: null, sex: "m", age: "child", skin: "skin1", hair: "hBlack", style: "curly", eye: "cBlue" },
  },
} satisfies Record<string, Resident>

export { residents }
