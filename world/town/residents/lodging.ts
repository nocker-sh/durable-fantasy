import type { Resident } from "../resident.ts"

const residents = {
  ヘルタ: {
    map: "phanthiet-market",
    name: "ヘルタ",
    job: "下宿屋",
    at: [11, 36.2],
    item: "bucket",
    look: { skirt: "long", footwear: "shoes", shoes: "leatherD", top: "cWine", apron: "cLinen", cape: "cGray", sex: "f", age: "old", skin: "skin2", hair: "hGray", style: "bun", hat: "kerchief", hatRamp: "cWine", eye: "cGray" },
  },
  キリアン: {
    map: "phanthiet-market",
    name: "キリアン",
    job: "道具屋の昼番",
    at: [14.2, 23],
    item: null,
    look: { legs: "breeches", footwear: "shoes", hose: "cCream", shoes: "leatherK", top: "cBlue", bottom: "cGray", vest: "cMustard", sex: "m", skin: "skin1", hair: "hRed", style: "short", eye: "cGreen" },
  },
  ヴィープケ: {
    map: "phanthiet-market",
    name: "ヴィープケ",
    job: "薬屋の昼番",
    at: [9.4, 23],
    item: null,
    look: { skirt: "mid", footwear: "shoes", shoes: "leatherR", top: "cMint", apron: "cCream", bodice: "cGreen", sex: "f", skin: "skin2", hair: "hBlack", style: "braid", eye: "cGreen" },
  },
  ネーレ: {
    map: "phanthiet-market",
    name: "ネーレ",
    job: "仕立て屋のお針子",
    at: [28.6, 23],
    item: null,
    look: { skirt: "short", footwear: "shoes", hose: "cRose", shoes: "leatherR", top: "cRose", bow: "cPlum", jacket: "cLilac", sex: "f", skin: "skin1", hair: "hBrown", style: "curly", eye: "cBlue" },
  },
  レオポルト: {
    map: "phanthiet",
    name: "レオポルト",
    job: "パン焼きの職人",
    at: [10.6, 23],
    item: "peel",
    look: { legs: "straight", footwear: "shoes", shoes: "leatherD", top: "cLinen", bottom: "cCream", apron: "cCream", collar: null, sex: "m", skin: "skin2", hair: "hBlond", style: "short", hat: "cap", hatRamp: "cLinen", eye: "cBrown" },
  },
} satisfies Record<string, Resident>

export { residents }
