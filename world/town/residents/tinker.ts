import type { Resident } from "../resident.ts"

const residents = {
  クルト: {
    map: "phanthiet-gate",
    name: "クルト",
    job: "鋳掛け屋",
    at: [20.2, 25],
    item: "hammer",
    look: {
      legs: "straight",
      footwear: "boots",
      shoes: "leatherD",
      top: "cWine",
      bottom: "cBrown",
      apron: "leather",
      collar: null,
      sex: "m",
      skin: "skin2",
      hair: "hRed",
      style: "curly",
      eye: "cGreen",
    },
  },
  ザビーネ: {
    map: "phanthiet-gate",
    name: "ザビーネ",
    job: "研ぎ屋",
    at: [20.2, 28.4],
    item: null,
    look: { skirt: "mid", footwear: "clogs", top: "cMustard", apron: "leather", bodice: "cBrown", frill: false, sex: "f", skin: "skin2", hair: "hRed", style: "pony", eye: "cGreen" },
  },
  ヨハン: {
    map: "phanthiet-gate",
    name: "ヨハン",
    job: "子ども",
    at: [21, 26.2],
    item: null,
    look: { legs: "breeches", footwear: "clogs", hose: "cGray", top: "cMustard", bottom: "cBrown", collar: null, sex: "m", age: "child", skin: "skin2", hair: "hRed", style: "short", eye: "cGreen" },
  },
  リナ: {
    map: "phanthiet-gate",
    name: "リナ",
    job: "子ども",
    at: [21, 27.2],
    item: null,
    look: { skirt: "short", footwear: "clogs", hose: "cGray", top: "cMustard", frill: true, bow: "cRed", sex: "f", age: "child", skin: "skin2", hair: "hRed", style: "braid", eye: "cGreen" },
  },
} satisfies Record<string, Resident>

export { residents }
