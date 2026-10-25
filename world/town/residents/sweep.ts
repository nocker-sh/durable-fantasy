import type { Resident } from "../resident.ts";

const residents = {
  ベルンハルト: {
    map: "phanthiet-craft",
    name: "ベルンハルト",
    job: "煙突掃除",
    at: [22, 30.8],
    item: "broom",
    look: { legs: "straight", footwear: "boots", shoes: "leatherK", top: "hBlack", bottom: "cGray", collar: null, belt: true, sex: "m", skin: "skin1", hair: "hBlack", style: "short", eye: "cBlue" },
  },
  モニカ: {
    map: "phanthiet-craft",
    name: "モニカ",
    job: "灰売り",
    at: [22, 35.6],
    item: "sack",
    look: { skirt: "mid", footwear: "clogs", top: "cGray", apron: "cLinen", bodice: "cBrown", frill: false, sex: "f", skin: "skin1", hair: "hRed", style: "bun", eye: "cGreen" },
  },
  トビアス: {
    map: "phanthiet-craft",
    name: "トビアス",
    job: "煙突掃除の弟子",
    at: [22.6, 30.2],
    item: "broom",
    look: { legs: "tucked", footwear: "shoes", shoes: "leatherK", top: "hBlack", bottom: "cGray", collar: null, sex: "m", age: "child", skin: "skin1", hair: "hBrown", style: "short", eye: "cBlue" },
  },
} satisfies Record<string, Resident>;

export { residents };
