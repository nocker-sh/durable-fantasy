import type { Resident } from "../resident.ts";

const residents = {
  ファルク: {
    map: "phanthiet-gate",
    name: "ファルク",
    job: "猟師",
    at: [8, 21.6],
    item: "axe",
    look: {
      footwear: "wraps",
      shoes: "leatherD",
      top: "cGreen",
      bottom: "cBrown",
      vest: "leather",
      cape: "cBrown",
      gloves: "leather",
      belt: true,
      sex: "m",
      skin: "skin3",
      hair: "hBlack",
      style: "short",
      eye: "cBrown",
    },
  },
  ブリギッテ: {
    map: "phanthiet-gate",
    name: "ブリギッテ",
    job: "燻し屋",
    at: [4.8, 21.8],
    item: null,
    look: { skirt: "mid", footwear: "boots", shoes: "leatherD", top: "cWine", apron: "leather", bodice: "cBrown", frill: false, sex: "f", skin: "skin3", hair: "hBrown", style: "bun", eye: "cBrown" },
  },
  ロルフ: {
    map: "phanthiet-gate",
    name: "ロルフ",
    job: "猟師の息子",
    at: [9.6, 21.4],
    item: "staff",
    look: { footwear: "wraps", shoes: "leatherD", top: "cMint", bottom: "cBrown", vest: "leather", belt: true, sex: "m", skin: "skin3", hair: "hBlack", style: "curly", eye: "cBrown" },
  },
} satisfies Record<string, Resident>;

export { residents };
