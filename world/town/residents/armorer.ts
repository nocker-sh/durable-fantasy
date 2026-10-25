import type { Resident } from "../resident.ts";

const residents = {
  ベアトリクス: {
    map: "phanthiet-craft",
    name: "ベアトリクス",
    job: "防具屋",
    at: "armorer",
    item: "hammer",
    look: {
      legs: "straight",
      shoes: "leatherK",
      top: "cWine",
      bottom: "cBrown",
      apron: "leather",
      gloves: "leather",
      collar: null,
      sex: "f",
      skin: "skin2",
      hair: "hRed",
      style: "braid",
      eye: "cBrown",
    },
  },
  ルイーゼ: {
    map: "phanthiet-craft",
    name: "ルイーゼ",
    job: "防具屋の見習い",
    at: "armorer",
    item: "hammer",
    look: {
      legs: "straight",
      shoes: "leatherK",
      top: "cGray",
      bottom: "cBrown",
      apron: "leather",
      gloves: "leather",
      collar: null,
      sex: "f",
      skin: "skin1",
      hair: "hBrown",
      style: "pony",
      eye: "cGray",
    },
  },
} satisfies Record<string, Resident>;

export { residents };
