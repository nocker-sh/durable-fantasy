import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A small round rock-dweller with two great dish ears, the last of a wartime listening post. */
export const draft: MonsterDraft = {
  home: "mountain-pass",
  life: "岩の隙間に住み、夏のうちに草を刈り集めて石の陰に積んでおき、冬はそれを食べる。人の足音を遠くから聞きつけ、すぐ岩の間へ隠れる。",
  origin: "大戦で谷の向こうの物音を聞き取るために作られた生き物の子孫。皿のような大きな耳が残った。",
  kind: {
    name: "皿耳ねずみ",
    hp: 40,
    def: 1,
    flee: 28,
    atk: 0,
    hit: 0,
    exp: 14,
    respawn: 120,
    look: "figure",
    size: 1.2,
    drops: [
      { item: "soft-fur", chance: 0.6 },
      { item: "herb", chance: 0.15 },
    ],
    figure: {
      palette: { hide: 0x8a7f6e, belly: 0xc8bca6, dark: 0x4a4038, accent: 0xb89282 },
      parts: [
        { shape: "ball", size: [0.1, 0.08, 0.12], at: [0, 0.085, -0.02], paint: "hide" },
        { shape: "ball", size: [0.085, 0.05, 0.1], at: [0, 0.055, -0.01], paint: "belly" },
        { shape: "ball", size: [0.07, 0.065, 0.07], at: [0, 0.12, 0.1], paint: "hide" },
        { shape: "ball", size: [0.03, 0.025, 0.025], at: [0, 0.105, 0.165], paint: "belly" },
        { shape: "box", size: [0.014, 0.012, 0.01], at: [0, 0.112, 0.19], paint: "dark" },
        { shape: "box", size: [0.018, 0.02, 0.016], at: [0.04, 0.135, 0.15], paint: "eye" },
        { shape: "box", size: [0.018, 0.02, 0.016], at: [-0.04, 0.135, 0.15], paint: "eye" },
        { shape: "rod", size: [0.012, 0.125, 0.016], at: [0.078, 0.215, 0.082], turn: [-0.165, 0, -0.75], paint: "hide", swing: "flap", pivot: [0.035, 0.17, 0.09] },
        { shape: "cone", size: [0.11, 0.045, 9], at: [0.12, 0.26, 0.075], turn: [-1.989, 0, 0.667], paint: "hide", swing: "flap", pivot: [0.035, 0.17, 0.09] },
        { shape: "rod", size: [0.088, 0.008, 0.088], at: [0.135, 0.268, 0.093], turn: [-1.989, 0, 0.667], paint: "accent", swing: "flap", pivot: [0.035, 0.17, 0.09] },
        { shape: "rod", size: [0.012, 0.125, 0.016], at: [-0.077, 0.215, 0.082], turn: [-0.165, 0, 0.75], paint: "hide", swing: "flap", pivot: [-0.035, 0.17, 0.09] },
        { shape: "cone", size: [0.11, 0.045, 9], at: [-0.12, 0.26, 0.075], turn: [-1.989, 0, -0.667], paint: "hide", swing: "flap", pivot: [-0.035, 0.17, 0.09] },
        { shape: "rod", size: [0.088, 0.008, 0.088], at: [-0.135, 0.268, 0.093], turn: [-1.989, 0, -0.667], paint: "accent", swing: "flap", pivot: [-0.035, 0.17, 0.09] },
        { shape: "box", size: [0.035, 0.04, 0.045], at: [0.055, 0.02, 0.07], paint: "dark", swing: "stride-a", pivot: [0.055, 0.05, 0.07] },
        { shape: "box", size: [0.035, 0.04, 0.045], at: [-0.055, 0.02, 0.07], paint: "dark", swing: "stride-b", pivot: [-0.055, 0.05, 0.07] },
        { shape: "box", size: [0.04, 0.035, 0.055], at: [0.06, 0.018, -0.1], paint: "dark", swing: "stride-b", pivot: [0.06, 0.05, -0.1] },
        { shape: "box", size: [0.04, 0.035, 0.055], at: [-0.06, 0.018, -0.1], paint: "dark", swing: "stride-a", pivot: [-0.06, 0.05, -0.1] },
      ],
    },
  },
}
