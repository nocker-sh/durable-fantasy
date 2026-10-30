import type { Resident } from "#/world/town/resident"

const residents = {
  ギュンター: {
    name: "ギュンター",
    job: "鍛冶屋",
    at: "anvil",
    item: "hammer",
    look: {
      legs: "straight",
      shoes: "leatherK",
      top: "cWine",
      bottom: "cBrown",
      apron: "leather",
      gloves: "leather",
      collar: null,
      buttons: "iron",
      sex: "m",
      skin: "skin2",
      hair: "hBlack",
      style: "short",
      eye: "cBrown",
    },
  },
  ペーター: {
    name: "ペーター",
    job: "鍛冶見習い",
    at: "forge",
    item: null,
    look: {
      jacket: "cBlue",
      trim: "gold",
      legs: "breeches",
      footwear: "shoes",
      hose: "cCream",
      shoes: "leatherR",
      top: "cSky",
      bottom: "cCream",
      vest: "leather",
      collar: "cCream",
      buttons: "gold",
      sex: "m",
      age: "child",
      skin: "skin1",
      hair: "hBlond",
      style: "curly",
      eye: "cBlue",
    },
  },
} satisfies Record<string, Resident>

export { residents }
