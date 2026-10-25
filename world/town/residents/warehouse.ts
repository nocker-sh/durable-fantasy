import type { Resident } from "../resident.ts";

const residents = {
  ヒルデ: {
    map: "phanthiet-gate",
    name: "ヒルデ",
    job: "倉庫番",
    at: "warehouse",
    item: null,
    look: { skirt: "mid", footwear: "clogs", top: "cHoney", apron: "cLinen", bodice: "cBrown", frill: true, bow: "cSky", sex: "f", skin: "skin1", hair: "hBrown", style: "bun", eye: "cBrown" },
  },
  ゲオルク: {
    map: "phanthiet-gate",
    name: "ゲオルク",
    job: "荷担ぎ",
    at: "warehouse",
    item: "sack",
    look: {
      legs: "tucked",
      footwear: "boots",
      shoes: "leatherD",
      top: "cBrown",
      bottom: "cGray",
      vest: "leather",
      collar: null,
      belt: true,
      sex: "m",
      skin: "skin1",
      hair: "hBrown",
      style: "bald",
      eye: "cBrown",
    },
  },
} satisfies Record<string, Resident>;

export { residents };
