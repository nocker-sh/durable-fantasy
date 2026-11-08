import type { Resident } from "#/world/town/resident"

const residents = {
  コンスタンティン: {
    map: "phanthiet-market",
    name: "コンスタンティン",
    job: "結晶商",
    at: "crystal",
    item: null,
    look: {
      legs: "straight",
      footwear: "boots",
      shoes: "leatherK",
      top: "cGray",
      bottom: "cGray",
      jacket: "cBlue",
      trim: "gold",
      buttons: "gold",
      collar: "cCream",
      gloves: "leather",
      sex: "m",
      skin: "skin3",
      hair: "hBlack",
      style: "short",
      eye: "cBrown",
    },
  },
} satisfies Record<string, Resident>

export { residents }
