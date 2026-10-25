import type { Resident } from "../resident.ts"

const residents = {
  ゴットフリート: {
    map: "phanthiet-craft",
    name: "ゴットフリート",
    job: "木工師",
    at: "woodworker",
    item: "axe",
    look: { footwear: "wraps", shoes: "leatherD", top: "cMint", bottom: "cBrown", vest: "wool", collar: null, belt: true, sex: "m", skin: "skin1", hair: "hBlond", style: "curly", eye: "cGreen" },
  },
  アントン: {
    map: "phanthiet-craft",
    name: "アントン",
    job: "樽職人",
    at: [16.2, 22.1],
    item: "hammer",
    look: {
      legs: "straight",
      footwear: "boots",
      shoes: "leatherD",
      top: "cSky",
      bottom: "cBrown",
      apron: "leather",
      collar: null,
      belt: true,
      sex: "m",
      skin: "skin1",
      hair: "hBlond",
      style: "curly",
      eye: "cBlue",
    },
  },
} satisfies Record<string, Resident>

export { residents }
