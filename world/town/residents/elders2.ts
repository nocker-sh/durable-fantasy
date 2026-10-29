import type { Resident } from "../resident.ts"

const residents = {
  エルヴィン: {
    map: "phanthiet",
    name: "エルヴィン",
    job: "隠居の大工",
    at: [12.2, 44.2],
    item: null,
    look: { legs: "straight", footwear: "shoes", shoes: "leatherD", top: "cHoney", bottom: "cBrown", vest: "cBrown", sex: "m", age: "old", skin: "skin1", hair: "hGray", style: "bald", eye: "cGreen" },
  },
  アーデルハイト: {
    map: "phanthiet",
    name: "アーデルハイト",
    job: "隠居",
    at: [12.3, 46.2],
    item: null,
    look: { skirt: "long", footwear: "shoes", shoes: "leatherR", top: "cRose", cape: "cWine", sex: "f", age: "old", skin: "skin2", hair: "hGray", style: "bun", eye: "cGreen" },
  },
} satisfies Record<string, Resident>

export { residents }
