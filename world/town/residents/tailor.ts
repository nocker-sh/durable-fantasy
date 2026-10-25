import type { Resident } from "../resident.ts";

const residents = {
  マグダレーナ: {
    map: "phanthiet-market",
    name: "マグダレーナ",
    job: "仕立て屋",
    at: "tailor",
    item: null,
    look: {
      skirt: "mid",
      footwear: "shoes",
      hose: "cRose",
      shoes: "leatherR",
      top: "cLilac",
      jacket: "cPlum",
      trim: "gold",
      bow: "cRose",
      sex: "f",
      skin: "skin1",
      hair: "hBlond",
      style: "pony",
      eye: "cBlue",
    },
  },
  ロッテ: {
    map: "phanthiet-market",
    name: "ロッテ",
    job: "お針子",
    at: "tailor",
    item: null,
    look: {
      skirt: "mid",
      footwear: "shoes",
      hose: "cLilac",
      shoes: "leatherR",
      top: "cRose",
      jacket: "cLilac",
      trim: "cPlum",
      bow: "cPlum",
      sex: "f",
      skin: "skin1",
      hair: "hRed",
      style: "bob",
      eye: "cBlue",
    },
  },
} satisfies Record<string, Resident>;

export { residents };
