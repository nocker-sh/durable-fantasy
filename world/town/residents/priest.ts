import type { Resident } from "../resident.ts"

const residents = {
  ベネディクト: {
    name: "ベネディクト",
    job: "修道士",
    at: "chapelDoor",
    item: null,
    look: { sex: "m", age: "old", skin: "skin1", hair: "hGray", style: "short", top: "hBlack", robe: true, belt: false, eye: "cBlue" },
  },
  クレメンス: {
    name: "クレメンス",
    job: "修道士の見習い",
    at: [13, 8.6],
    item: null,
    look: { sex: "m", skin: "skin1", hair: "hBrown", style: "short", top: "cBrown", robe: true, belt: true, eye: "cGreen" },
  },
} satisfies Record<string, Resident>

export { residents }
