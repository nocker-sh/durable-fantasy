import type { Resident } from "../resident"

const residents = {
  テオ: {
    map: "phanthiet-gate",
    name: "テオ",
    job: "案内人",
    at: "guide",
    item: "staff",
    look: {
      legs: "breeches",
      footwear: "boots",
      hose: "cCream",
      shoes: "leatherD",
      top: "cHoney",
      bottom: "cBrown",
      cape: "cMustard",
      collar: "cCream",
      belt: true,
      sex: "m",
      skin: "skin1",
      hair: "hBrown",
      style: "short",
      eye: "cGreen",
    },
  },
} satisfies Record<string, Resident>

export { residents }
