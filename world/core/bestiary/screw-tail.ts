import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A chubby night burrower that twists itself backwards into the sand with a hard, ridged drill of a tail. */
export const draft: MonsterDraft = {
  home: "red-dunes",
  life: "夜に巣穴から出て、枯れ草の根と落ちた種を食べる。昼は尾をねじりながら後ろ向きに砂へもぐって顔だけ出して休み、人が近づくとそのまま砂の中へ消える。",
  origin: "固い地面に穴をあける兵器の子孫で、ねじのように溝の巻いた硬い尾が残った。",
  kind: {
    name: "ねじ尾",
    hp: 56,
    def: 5,
    flee: 16,
    atk: 8,
    hit: 14,
    exp: 28,
    respawn: 120,
    look: "figure",
    size: 1,
    drops: [
      { item: "soft-fur", chance: 0.5 },
      { item: "sharp-fang", chance: 0.2 },
    ],
    figure: {
      palette: { hide: 0xc08a5e, belly: 0xe2c8a4, dark: 0x5a4a40, bone: 0x9a948a },
      parts: [
        { shape: "ball", size: [0.11, 0.09, 0.12], at: [0, 0.1, 0.02], paint: "hide" },
        { shape: "ball", size: [0.09, 0.06, 0.1], at: [0, 0.07, 0.04], paint: "belly" },
        { shape: "ball", size: [0.07, 0.062, 0.065], at: [0, 0.115, 0.13], paint: "hide", swing: "nod", pivot: [0, 0.12, 0.08] },
        { shape: "ball", size: [0.03, 0.026, 0.03], at: [0, 0.1, 0.19], paint: "belly", swing: "nod", pivot: [0, 0.12, 0.08] },
        { shape: "box", size: [0.016, 0.016, 0.016], at: [-0.04, 0.135, 0.18], paint: "eye", swing: "nod", pivot: [0, 0.12, 0.08] },
        { shape: "box", size: [0.016, 0.016, 0.016], at: [0.04, 0.135, 0.18], paint: "eye", swing: "nod", pivot: [0, 0.12, 0.08] },
        { shape: "ball", size: [0.022, 0.026, 0.01], at: [-0.045, 0.18, 0.11], paint: "hide", swing: "nod", pivot: [0, 0.12, 0.08] },
        { shape: "ball", size: [0.022, 0.026, 0.01], at: [0.045, 0.18, 0.11], paint: "hide", swing: "nod", pivot: [0, 0.12, 0.08] },
        { shape: "box", size: [0.04, 0.05, 0.05], at: [-0.07, 0.025, 0.08], paint: "hide", swing: "stride-a", pivot: [-0.07, 0.06, 0.08] },
        { shape: "box", size: [0.04, 0.05, 0.05], at: [0.07, 0.025, 0.08], paint: "hide", swing: "stride-b", pivot: [0.07, 0.06, 0.08] },
        { shape: "box", size: [0.04, 0.05, 0.05], at: [-0.07, 0.025, -0.05], paint: "hide", swing: "stride-b", pivot: [-0.07, 0.06, -0.05] },
        { shape: "box", size: [0.04, 0.05, 0.05], at: [0.07, 0.025, -0.05], paint: "hide", swing: "stride-a", pivot: [0.07, 0.06, -0.05] },
        { shape: "cone", size: [0.07, 0.367, 6], at: [0, 0.065, -0.26], turn: [-1.763, 0, 0], paint: "bone", swing: "wag", pivot: [0, 0.1, -0.08] },
        { shape: "rod", size: [0.061, 0.016, 0.061], at: [0, 0.087, -0.145], turn: [-1.763, 0.35, 0], paint: "dark", swing: "wag", pivot: [0, 0.1, -0.08] },
        { shape: "rod", size: [0.047, 0.016, 0.047], at: [0, 0.073, -0.217], turn: [-1.763, -0.35, 0], paint: "dark", swing: "wag", pivot: [0, 0.1, -0.08] },
        { shape: "rod", size: [0.033, 0.016, 0.033], at: [0, 0.059, -0.289], turn: [-1.763, 0.35, 0], paint: "dark", swing: "wag", pivot: [0, 0.1, -0.08] },
        { shape: "rod", size: [0.021, 0.016, 0.021], at: [0, 0.047, -0.354], turn: [-1.763, -0.35, 0], paint: "dark", swing: "wag", pivot: [0, 0.1, -0.08] },
      ],
    },
  },
}
