import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A flower that walks on its roots and puffs sticky yellow pollen at whatever comes close, the last of a wartime marking weapon. */
export const draft: MonsterDraft = {
  home: "south-meadow",
  life: "根を土に差して水を吸い、日が傾くと根を抜いて日当たりのよい場所へ歩いて移る。人が近づくと花の真ん中の玉から黄色い粉を吹きかけ、その場でじっとする。",
  origin: "大戦で敵に色の粉をかけて目印にした兵器の子孫。落ちにくい粉を吹き出す花の玉が残った。",
  kind: {
    name: "粉ふき花",
    hp: 22,
    def: 0,
    flee: 4,
    atk: 0,
    hit: 0,
    exp: 8,
    respawn: 160,
    look: "figure",
    size: 1,
    drops: [
      { item: "meadow-flower", chance: 0.7 },
      { item: "herb", chance: 0.25 },
    ],
    figure: {
      palette: { hide: 0x6a7a4a, belly: 0x8a9a5e, dark: 0x5a4a38, accent: 0xb88a8a, bone: 0xe0d4b4, glow: 0xd8c070 },
      parts: [
        { shape: "ball", size: [0.05, 0.04, 0.05], at: [0, 0.05, 0], paint: "dark" },
        { shape: "rod", size: [0.012, 0.065, 0.016], at: [-0.041, 0.05, 0.041], turn: [0, 0.785, 1.571], paint: "dark", swing: "stride-a", pivot: [-0.018, 0.05, 0.018] },
        { shape: "rod", size: [0.012, 0.067, 0.006], at: [-0.081, 0.028, 0.081], turn: [0, -2.356, 0.849], paint: "dark", swing: "stride-a", pivot: [-0.018, 0.05, 0.018] },
        { shape: "rod", size: [0.012, 0.065, 0.016], at: [0.041, 0.05, 0.041], turn: [0, 2.356, 1.571], paint: "dark", swing: "stride-b", pivot: [0.018, 0.05, 0.018] },
        { shape: "rod", size: [0.012, 0.067, 0.006], at: [0.081, 0.028, 0.081], turn: [0, -0.785, 0.849], paint: "dark", swing: "stride-b", pivot: [0.018, 0.05, 0.018] },
        { shape: "rod", size: [0.012, 0.065, 0.016], at: [-0.041, 0.05, -0.041], turn: [0, -0.785, 1.571], paint: "dark", swing: "stride-b", pivot: [-0.018, 0.05, -0.018] },
        { shape: "rod", size: [0.012, 0.067, 0.006], at: [-0.081, 0.028, -0.081], turn: [0, 2.356, 0.849], paint: "dark", swing: "stride-b", pivot: [-0.018, 0.05, -0.018] },
        { shape: "rod", size: [0.012, 0.065, 0.016], at: [0.041, 0.05, -0.041], turn: [0, -2.356, 1.571], paint: "dark", swing: "stride-a", pivot: [0.018, 0.05, -0.018] },
        { shape: "rod", size: [0.012, 0.067, 0.006], at: [0.081, 0.028, -0.081], turn: [0, 0.785, 0.849], paint: "dark", swing: "stride-a", pivot: [0.018, 0.05, -0.018] },
        { shape: "rod", size: [0.016, 0.351, 0.022], at: [0, 0.245, 0.01], turn: [0, 1.571, 0.057], paint: "hide", swing: "sway", pivot: [0, 0.07, 0] },
        { shape: "box", size: [0.11, 0.008, 0.05], at: [-0.06, 0.2, 0], turn: [0, 0, -0.45], paint: "belly", swing: "sway", pivot: [0, 0.07, 0] },
        { shape: "box", size: [0.11, 0.008, 0.05], at: [0.06, 0.2, 0], turn: [0, 0, 0.45], paint: "belly", swing: "sway", pivot: [0, 0.07, 0] },
        { shape: "rod", size: [0.045, 0.05, 0.016], at: [0, 0.418, 0.018], turn: [0.5, 0, 0], paint: "hide", swing: "sway", pivot: [0, 0.07, 0] },
        { shape: "rod", size: [0.13, 0.012, 0.13], at: [0, 0.444, 0.032], turn: [0.5, 0, 0], paint: "accent", swing: "sway", pivot: [0, 0.07, 0] },
        { shape: "rod", size: [0.1, 0.012, 0.1], at: [0, 0.451, 0.036], turn: [0.5, 0.524, 0], paint: "bone", swing: "sway", pivot: [0, 0.07, 0] },
        { shape: "ball", size: [0.05, 0.045, 0.05], at: [0, 0.479, 0.052], paint: "glow", swing: "pulse", pivot: [0, 0.479, 0.052] },
      ],
    },
  },
}
