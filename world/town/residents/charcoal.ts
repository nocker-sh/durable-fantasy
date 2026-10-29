import type { Resident } from "../resident.ts"

const residents = {
  ゼヴェリン: {
    map: "forest-edge",
    name: "ゼヴェリン",
    job: "炭焼き",
    at: [19.6, 23.2],
    item: "axe",
    look: { legs: "straight", footwear: "wraps", top: "cGray", bottom: "cGray", vest: "cBrown", gloves: "leatherK", sex: "m", skin: "skin3", hair: "hBlack", style: "short", hat: "hood", hatRamp: "cGray", eye: "cBrown" },
  },
  ヴァルトラウト: {
    map: "forest-edge",
    name: "ヴァルトラウト",
    job: "炭焼きのおかみ",
    at: [22.8, 25.4],
    item: "sack",
    look: { skirt: "mid", footwear: "clogs", top: "cGray", apron: "leather", sex: "f", skin: "skin3", hair: "hBrown", style: "braid", hat: "kerchief", hatRamp: "cGray", eye: "cBrown" },
  },
  ティル: {
    map: "forest-edge",
    name: "ティル",
    job: "窯の番",
    at: [21, 26.6],
    item: null,
    look: { legs: "breeches", footwear: "clogs", hose: "cBrown", top: "cBrown", bottom: "cGray", sex: "m", skin: "skin3", hair: "hBlack", style: "curly", eye: "cBrown" },
  },
} satisfies Record<string, Resident>

export { residents }
