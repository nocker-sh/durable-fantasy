import type { Resident } from "../resident.ts"

const residents = {
  ヴィルヘルム: {
    name: "ヴィルヘルム",
    job: "老人",
    at: "bench",
    item: "staff",
    look: {
      jacket: "cBrown",
      trim: "cHoney",
      buttons: "gold",
      legs: "straight",
      footwear: "shoes",
      shoes: "leatherD",
      top: "cGray",
      bottom: "cBrown",
      collar: "cCream",
      sex: "m",
      age: "old",
      skin: "skin2",
      hair: "hGray",
      style: "short",
      hat: "hood",
      hatRamp: "cBrown",
      eye: "cBrown",
    },
  },
  ゾフィー: {
    name: "ゾフィー",
    job: "庭仕事",
    at: "garden",
    item: "hoe",
    look: {
      skirt: "mid",
      overskirt: "cRed",
      shoes: "leatherD",
      top: "cRose",
      apron: "cCream",
      frill: true,
      bow: "cHoney",
      trim: "cWine",
      sex: "f",
      skin: "skin1",
      hair: "hBlack",
      style: "bob",
      hat: "kerchief",
      hatRamp: "cBlue",
      eye: "cBrown",
    },
  },
} satisfies Record<string, Resident>

export { residents }
