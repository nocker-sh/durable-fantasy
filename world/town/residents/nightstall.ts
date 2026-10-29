import type { Resident } from "../resident.ts"

const residents = {
  ドミニク: {
    map: "phanthiet-market",
    name: "ドミニク",
    job: "汁物屋",
    at: [22.6, 30.4],
    item: "bucket",
    look: { legs: "straight", footwear: "boots", shoes: "leatherK", top: "cPlum", bottom: "cGray", apron: "cCream", sex: "m", skin: "skin2", hair: "hBlack", style: "curly", eye: "cBrown" },
  },
  レア: {
    map: "phanthiet-market",
    name: "レア",
    job: "汁物屋のおかみ",
    at: [24.2, 30.6],
    item: null,
    look: { skirt: "mid", footwear: "shoes", shoes: "leatherR", top: "cWine", apron: "cLinen", bow: "cCream", sex: "f", skin: "skin3", hair: "hBrown", style: "bob", eye: "cBrown" },
  },
  リヌス: {
    map: "phanthiet-market",
    name: "リヌス",
    job: "子ども",
    at: [26.2, 31],
    item: null,
    look: { legs: "breeches", footwear: "shoes", hose: "cPlum", shoes: "leatherK", top: "cPlum", bottom: "cGray", sex: "m", age: "child", skin: "skin2", hair: "hBlack", style: "short", eye: "cBrown" },
  },
} satisfies Record<string, Resident>

export { residents }
