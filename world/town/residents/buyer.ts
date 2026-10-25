import type { Resident } from "../resident.ts"

const residents = {
  ラインホルト: {
    map: "phanthiet-market",
    name: "ラインホルト",
    job: "買取屋",
    at: "buyer",
    item: null,
    look: {
      legs: "straight",
      footwear: "boots",
      shoes: "leatherD",
      top: "cHoney",
      bottom: "cBrown",
      vest: "leather",
      collar: null,
      belt: true,
      sex: "m",
      age: "old",
      skin: "skin2",
      hair: "hGray",
      style: "short",
      eye: "cBrown",
    },
  },
  カスパー: {
    map: "phanthiet-market",
    name: "カスパー",
    job: "荷運び",
    at: [3.5, 25.6],
    item: "sack",
    look: {
      legs: "tucked",
      footwear: "boots",
      shoes: "leatherD",
      top: "cHoney",
      bottom: "cBrown",
      vest: "leather",
      collar: null,
      belt: true,
      sex: "m",
      skin: "skin2",
      hair: "hBrown",
      style: "short",
      eye: "cBrown",
    },
  },
} satisfies Record<string, Resident>

export { residents }
