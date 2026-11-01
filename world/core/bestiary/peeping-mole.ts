import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A blind burrower that looks out through one lens on a long neck, the last of a wartime trench lookout. */
export const draft: MonsterDraft = {
  home: "south-meadow",
  life: "土の中のミミズや草の根を食べる。巣穴で休むときも長い首だけを地面から出してあたりを見ていて、人が近づくと首を縮めて穴へ潜る。",
  origin: "大戦で塹壕の中から外をのぞいた見張りの兵器の子孫。長い首の先のレンズのような目が残った。",
  kind: {
    name: "覗きもぐら",
    hp: 20,
    def: 0,
    flee: 22,
    atk: 0,
    hit: 0,
    exp: 7,
    respawn: 140,
    look: "figure",
    size: 1.1,
    drops: [
      { item: "soft-fur", chance: 0.55 },
      { item: "herb", chance: 0.15 },
    ],
    figure: {
      palette: { hide: 0x5c4c46, belly: 0x8a7868, dark: 0x2e2826, bone: 0xc8a898, glow: 0xc4d8d0 },
      parts: [
        { shape: "ball", size: [0.11, 0.065, 0.15], at: [0, 0.065, -0.01], paint: "hide" },
        { shape: "ball", size: [0.09, 0.055, 0.07], at: [0, 0.055, -0.14], paint: "hide" },
        { shape: "ball", size: [0.045, 0.04, 0.06], at: [0, 0.055, 0.14], paint: "hide" },
        { shape: "ball", size: [0.018, 0.016, 0.016], at: [0, 0.055, 0.2], paint: "bone" },
        { shape: "rod", size: [0.022, 0.067, 0.02], at: [-0.095, 0.04, 0.09], turn: [0, -2.761, 0.932], paint: "hide", swing: "stride-a", pivot: [-0.07, 0.06, 0.08] },
        { shape: "box", size: [0.07, 0.016, 0.07], at: [-0.13, 0.01, 0.12], turn: [0, -0.4, 0], paint: "bone", swing: "stride-a", pivot: [-0.07, 0.06, 0.08] },
        { shape: "box", size: [0.04, 0.016, 0.06], at: [-0.085, 0.009, -0.16], paint: "bone", swing: "stride-b", pivot: [-0.07, 0.05, -0.15] },
        { shape: "rod", size: [0.022, 0.067, 0.02], at: [0.095, 0.04, 0.09], turn: [0, -0.381, 0.932], paint: "hide", swing: "stride-b", pivot: [0.07, 0.06, 0.08] },
        { shape: "box", size: [0.07, 0.016, 0.07], at: [0.13, 0.01, 0.12], turn: [0, 0.4, 0], paint: "bone", swing: "stride-b", pivot: [0.07, 0.06, 0.08] },
        { shape: "box", size: [0.04, 0.016, 0.06], at: [0.085, 0.009, -0.16], paint: "bone", swing: "stride-a", pivot: [0.07, 0.05, -0.15] },
        { shape: "box", size: [0.014, 0.014, 0.05], at: [0, 0.05, -0.215], paint: "dark", swing: "wag", pivot: [0, 0.05, -0.19] },
        { shape: "rod", size: [0.034, 0.05, 0.042], at: [0, 0.115, 0.05], paint: "dark" },
        { shape: "rod", size: [0.017, 0.32, 0.022], at: [0, 0.28, 0.05], paint: "belly", swing: "sway", pivot: [0, 0.1, 0.05] },
        { shape: "rod", size: [0.024, 0.016, 0.024], at: [0, 0.24, 0.05], paint: "dark", swing: "sway", pivot: [0, 0.1, 0.05] },
        { shape: "rod", size: [0.024, 0.016, 0.024], at: [0, 0.34, 0.05], paint: "dark", swing: "sway", pivot: [0, 0.1, 0.05] },
        { shape: "box", size: [0.078, 0.072, 0.1], at: [0, 0.465, 0.07], paint: "hide", swing: "sway", pivot: [0, 0.1, 0.05] },
        { shape: "rod", size: [0.037, 0.008, 0.037], at: [0, 0.465, 0.12], turn: [0, 1.571, 1.571], paint: "dark", swing: "sway", pivot: [0, 0.1, 0.05] },
        { shape: "rod", size: [0.029, 0.01, 0.029], at: [0, 0.465, 0.125], turn: [0, 1.571, 1.571], paint: "glow", swing: "sway", pivot: [0, 0.1, 0.05] },
        { shape: "box", size: [0.04, 0.012, 0.06], at: [0, 0.506, 0.06], paint: "dark", swing: "sway", pivot: [0, 0.1, 0.05] },
      ],
    },
  },
}
