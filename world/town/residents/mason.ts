import type { Resident } from "#/world/town/resident"

const residents = {
  マルクス: {
    map: "phanthiet-craft",
    name: "マルクス",
    job: "石工",
    at: [17.8, 30.6],
    item: "hammer",
    look: {
      legs: "tucked",
      footwear: "boots",
      shoes: "leatherK",
      top: "cGray",
      bottom: "cBrown",
      apron: "leather",
      gloves: "leather",
      collar: null,
      sex: "m",
      skin: "skin2",
      hair: "hBlack",
      style: "short",
      eye: "cBrown",
    },
  },
  カタリーナ: {
    map: "phanthiet-craft",
    name: "カタリーナ",
    job: "灰汁作り",
    at: [17.8, 35.2],
    item: "bucket",
    look: { skirt: "mid", footwear: "clogs", top: "cRose", apron: "cLinen", bodice: "cBrown", frill: true, bow: "cWine", sex: "f", skin: "skin2", hair: "hBrown", style: "braid", eye: "cBrown" },
  },
  ダニエル: {
    map: "phanthiet-craft",
    name: "ダニエル",
    job: "石工の息子",
    at: [18.6, 32.4],
    item: "sack",
    look: { legs: "tucked", footwear: "boots", shoes: "leatherD", top: "cGray", bottom: "cBrown", collar: null, sex: "m", age: "child", skin: "skin2", hair: "hBlack", style: "short", eye: "cBrown" },
  },
  イダ: {
    map: "phanthiet-craft",
    name: "イダ",
    job: "子ども",
    at: [15.8, 35.4],
    item: null,
    look: { skirt: "short", footwear: "clogs", hose: "cRose", top: "cRose", frill: true, bow: "cWine", sex: "f", age: "child", skin: "skin2", hair: "hBlack", style: "bob", eye: "cBrown" },
  },
} satisfies Record<string, Resident>

export { residents }
