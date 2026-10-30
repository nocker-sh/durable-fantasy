import type { Resident } from "../resident"

const residents = {
  ブルーノ: {
    map: "phanthiet-market",
    name: "ブルーノ",
    job: "道具屋",
    at: "general",
    item: null,
    look: {
      legs: "breeches",
      footwear: "shoes",
      hose: "cCream",
      shoes: "leatherR",
      top: "cSky",
      bottom: "cBrown",
      vest: "leather",
      collar: "cCream",
      buttons: "iron",
      sex: "m",
      skin: "skin1",
      hair: "hBrown",
      style: "curly",
      eye: "cBlue",
    },
  },
} satisfies Record<string, Resident>

export { residents }
