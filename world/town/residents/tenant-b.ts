import type { Resident } from "../resident.ts"

const residents = {
  ヴェンデル: {
    map: "phanthiet-fields",
    name: "ヴェンデル",
    job: "小作の農夫",
    at: [2.4, 27.2],
    item: "hoe",
    look: { legs: "straight", footwear: "wraps", top: "cLinen", bottom: "cBrown", vest: "cGreen", collar: null, sex: "m", skin: "skin3", hair: "hRed", style: "short", hat: "straw", eye: "cGreen" },
  },
  アグネス: {
    map: "phanthiet-fields",
    name: "アグネス",
    job: "小作の農婦",
    at: [23, 16],
    item: "basket",
    look: { skirt: "long", footwear: "clogs", top: "cMustard", apron: "cCream", bodice: "cWine", sex: "f", skin: "skin3", hair: "hBlond", style: "bun", hat: "kerchief", hatRamp: "cMustard", eye: "cBrown" },
  },
  ルートヴィヒ: {
    map: "phanthiet-fields",
    name: "ルートヴィヒ",
    job: "小作の若者",
    at: [17, 30.4],
    item: "hoe",
    look: { legs: "breeches", footwear: "boots", hose: "cBrown", shoes: "leatherD", top: "cMint", bottom: "cBrown", sex: "m", skin: "skin3", hair: "hRed", style: "curly", eye: "cGreen" },
  },
  イルマ: {
    map: "phanthiet-fields",
    name: "イルマ",
    job: "糸紡ぎのおばあさん",
    at: [13.2, 22.2],
    item: null,
    look: { skirt: "long", footwear: "shoes", shoes: "leatherK", top: "cPlum", cape: "cGray", sex: "f", age: "old", skin: "skin3", hair: "hGray", style: "bun", hat: "coif", hatRamp: "cLinen", eye: "cGreen" },
  },
} satisfies Record<string, Resident>

export { residents }
