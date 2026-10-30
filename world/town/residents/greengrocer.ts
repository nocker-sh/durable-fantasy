import type { Resident } from "../resident"

const residents = {
  アンナ: {
    name: "アンナ",
    job: "洗濯女",
    at: "lavoir1",
    item: null,
    look: { overskirt: "cGreen", footwear: "clogs", top: "cMint", apron: "cCream", frill: true, trim: "cGreen", sex: "f", skin: "skin1", hair: "hBrown", style: "bun", hat: "coif", eye: "cBrown" },
  },
  グレーテ: {
    name: "グレーテ",
    job: "八百屋",
    at: "s2",
    item: null,
    look: {
      skirt: "mid",
      footwear: "clogs",
      top: "cMint",
      apron: "cCream",
      frill: true,
      bow: "cHoney",
      trim: "cGreen",
      sex: "f",
      skin: "skin1",
      hair: "hBrown",
      style: "bun",
      hat: "kerchief",
      hatRamp: "cMustard",
      eye: "cBrown",
    },
  },
} satisfies Record<string, Resident>

export { residents }
