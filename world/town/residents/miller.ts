import type { Resident } from "../resident.ts"

const residents = {
  ベルトラム: {
    map: "phanthiet",
    name: "ベルトラム",
    job: "粉屋",
    at: [37.4, 6.4],
    item: "sack",
    look: { legs: "straight", footwear: "clogs", top: "cCream", bottom: "cGray", apron: "cLinen", collar: null, sex: "m", skin: "skin1", hair: "hBlond", style: "short", hat: "cap", hatRamp: "cCream", eye: "cGray" },
  },
  イルゼ: {
    map: "phanthiet",
    name: "イルゼ",
    job: "粉屋のおかみ",
    at: [35, 6.6],
    item: null,
    look: { skirt: "long", footwear: "clogs", top: "cLinen", apron: "cCream", bodice: "cGreen", sex: "f", skin: "skin2", hair: "hRed", style: "bun", hat: "kerchief", hatRamp: "cCream", eye: "cGreen" },
  },
  クラウス: {
    map: "phanthiet",
    name: "クラウス",
    job: "粉屋の見習い",
    at: [38.6, 7.2],
    item: "sack",
    look: { legs: "breeches", footwear: "boots", hose: "cGray", shoes: "leatherD", top: "cGreen", bottom: "cGray", vest: "cBrown", sex: "m", skin: "skin1", hair: "hBlond", style: "curly", eye: "cGray" },
  },
} satisfies Record<string, Resident>

export { residents }
