import type { Resident } from "../resident.ts"

const residents = {
  レーニ: {
    map: "phanthiet-fields",
    name: "レーニ",
    job: "乳屋",
    at: [25, 30.4],
    item: "bucket",
    look: { skirt: "mid", footwear: "clogs", top: "cSky", apron: "cCream", bodice: "cBlue", sex: "f", skin: "skin1", hair: "hBlond", style: "braid", hat: "coif", hatRamp: "cCream", eye: "cSky" },
  },
  フーゴ: {
    map: "phanthiet-fields",
    name: "フーゴ",
    job: "牛飼いのおじいさん",
    at: [27.6, 37],
    item: "staff",
    look: { legs: "straight", footwear: "boots", shoes: "leatherD", top: "cBrown", bottom: "cCream", cape: "cBrown", sex: "m", age: "old", skin: "skin1", hair: "hGray", style: "short", hat: "hood", hatRamp: "cBrown", eye: "cSky" },
  },
  ピア: {
    map: "phanthiet-fields",
    name: "ピア",
    job: "子ども",
    at: [23, 29.6],
    item: null,
    look: { skirt: "short", footwear: "clogs", hose: "cSky", top: "cLilac", apron: "cCream", sex: "f", age: "child", skin: "skin1", hair: "hBlond", style: "bob", eye: "cSky" },
  },
} satisfies Record<string, Resident>

export { residents }
