import type { Resident } from "../resident"

const residents = {
  フェルディナント: {
    map: "phanthiet-market",
    name: "フェルディナント",
    job: "地図描き",
    at: [36.4, 25.6],
    item: "staff",
    look: {
      legs: "straight",
      footwear: "boots",
      shoes: "leatherD",
      top: "cCream",
      bottom: "cGray",
      jacket: "cGreen",
      trim: "cHoney",
      buttons: "gold",
      collar: "cCream",
      sex: "m",
      age: "old",
      skin: "skin1",
      hair: "hGray",
      style: "short",
      eye: "cGreen",
    },
  },
} satisfies Record<string, Resident>

export { residents }
