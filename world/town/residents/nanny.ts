import type { Resident } from "../resident.ts"

const residents = {
  アンネリー: {
    map: "phanthiet-fields",
    name: "アンネリー",
    job: "子守り",
    at: [10.2, 25.2],
    item: null,
    look: { skirt: "long", footwear: "shoes", shoes: "leatherR", top: "cLilac", apron: "cCream", cape: "cLilac", sex: "f", skin: "skin1", hair: "hBlond", style: "long", eye: "cBlue" },
  },
  エルナ: {
    map: "phanthiet-fields",
    name: "エルナ",
    job: "子守りのおばあさん",
    at: [9.4, 26.6],
    item: null,
    look: { skirt: "long", footwear: "shoes", shoes: "leatherK", top: "cPlum", cape: "cCream", sex: "f", age: "old", skin: "skin1", hair: "hGray", style: "bun", hat: "coif", hatRamp: "cCream", eye: "cBlue" },
  },
} satisfies Record<string, Resident>

export { residents }
