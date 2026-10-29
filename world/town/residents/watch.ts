import type { Resident } from "../resident.ts"

const residents = {
  コンラート: {
    map: "phanthiet-gate",
    name: "コンラート",
    job: "衛兵",
    at: [21.6, 26],
    item: "spear",
    look: { jacket: "cBlue", shoes: "iron", top: "cSky", bottom: "cGray", armor: "iron", gloves: "iron", collar: "cBlue", cape: "cBlue", sex: "m", skin: "skin2", hair: "hBlack", style: "short", hat: "helm", hatRamp: "iron", eye: "cBrown" },
  },
  ヘンリケ: {
    map: "phanthiet",
    name: "ヘンリケ",
    job: "衛兵",
    at: [20.6, 19.4],
    item: "spear",
    look: { jacket: "cBlue", shoes: "iron", top: "cSky", bottom: "cGray", armor: "iron", gloves: "iron", collar: "cBlue", cape: "cBlue", sex: "f", skin: "skin1", hair: "hRed", style: "braid", hat: "helm", hatRamp: "iron", eye: "cGreen" },
  },
  ロータル: {
    map: "phanthiet-market",
    name: "ロータル",
    job: "衛兵",
    at: [21, 26],
    item: "halberd",
    look: { jacket: "cBlue", shoes: "iron", top: "cSky", bottom: "cGray", armor: "iron", gloves: "iron", collar: "cBlue", cape: "cBlue", sex: "m", skin: "skin3", hair: "hBrown", style: "curly", hat: "helm", hatRamp: "iron", eye: "cGray" },
  },
} satisfies Record<string, Resident>

export { residents }
