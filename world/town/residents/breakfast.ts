import type { Resident } from "../resident.ts"

const residents = {
  オッティリエ: {
    map: "phanthiet-market",
    name: "オッティリエ",
    job: "朝の食堂のおかみ",
    at: [4.5, 36.2],
    item: null,
    look: { skirt: "long", footwear: "shoes", shoes: "leatherR", top: "cHoney", apron: "cLinen", bodice: "cBrown", sex: "f", skin: "skin2", hair: "hBlack", style: "bun", hat: "kerchief", hatRamp: "cHoney", eye: "cBrown" },
  },
  ベンノ: {
    map: "phanthiet-market",
    name: "ベンノ",
    job: "朝の食堂の亭主",
    at: [6.6, 36.1],
    item: "bucket",
    look: { legs: "straight", footwear: "shoes", shoes: "leatherD", top: "cLinen", bottom: "cBrown", apron: "cCream", collar: null, sex: "m", skin: "skin2", hair: "hBrown", style: "bald", eye: "cGray" },
  },
  ユッタ: {
    map: "phanthiet-market",
    name: "ユッタ",
    job: "食堂の働き手",
    at: [3.2, 36],
    item: "broom",
    look: { skirt: "mid", footwear: "clogs", top: "cGreen", apron: "cCream", bow: "cRed", sex: "f", skin: "skin1", hair: "hRed", style: "pony", eye: "cBlue" },
  },
} satisfies Record<string, Resident>

export { residents }
