import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A legless creature whose whole body is one ringed tube standing out of the sand. */
export const draft: MonsterDraft = {
  home: "red-dunes",
  life: "筒の口を風上に向け、風に乗ってくる草の種や小さな虫を吸い込んで食べる。体の下半分はいつも砂の中にあり、人が近づくと砂の中へ縮んで隠れ、叩かれると口から砂を吹きつける。",
  origin: "砂に潜って筒から弾を撃った生き物の兵器の子孫で、体は今も一本の長い筒のままである。",
  kind: {
    name: "砂筒",
    hp: 150,
    def: 7,
    flee: 6,
    atk: 14,
    hit: 24,
    exp: 62,
    respawn: 160,
    look: "figure",
    size: 1.15,
    drops: [
      { item: "rusty-scrap", chance: 0.6 },
      { item: "hard-shell", chance: 0.3 },
    ],
    figure: {
      palette: { hide: 0x9a6c52, belly: 0xcfae86, dark: 0x3a2620, accent: 0x7a5444, bone: 0xd8c8a8 },
      parts: [
        { shape: "ball", size: [0.28, 0.075, 0.28], at: [0, 0, 0], paint: "belly" },
        { shape: "ball", size: [0.11, 0.04, 0.1], at: [0.22, 0, 0.13], paint: "belly" },
        { shape: "ball", size: [0.09, 0.035, 0.1], at: [-0.17, 0, -0.18], paint: "belly" },
        { shape: "rod", size: [0.08, 0.62, 0.1], at: [0, 0.34, 0], paint: "hide", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "rod", size: [0.103, 0.03, 0.103], at: [0, 0.16, 0], paint: "accent", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "rod", size: [0.098, 0.03, 0.098], at: [0, 0.3, 0], paint: "accent", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "rod", size: [0.093, 0.03, 0.093], at: [0, 0.44, 0], paint: "accent", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "rod", size: [0.088, 0.03, 0.088], at: [0, 0.56, 0], paint: "accent", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "cone", size: [0.12, 0.1, 8], at: [0, 0.68, 0], turn: [3.142, 0, 0], paint: "accent", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "rod", size: [0.095, 0.012, 0.095], at: [0, 0.726, 0], paint: "dark", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "box", size: [0.022, 0.022, 0.016], at: [0, 0.6, 0.083], paint: "eye", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "box", size: [0.022, 0.022, 0.016], at: [0.06, 0.6, 0.058], turn: [0, 0.8, 0], paint: "eye", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "box", size: [0.022, 0.022, 0.016], at: [-0.06, 0.6, 0.058], turn: [0, -0.8, 0], paint: "eye", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "rod", size: [0.006, 0.136, 0.012], at: [0.067, 0.775, 0.123], turn: [0.568, 0, -0.286], paint: "bone", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "rod", size: [0.006, 0.136, 0.012], at: [0.121, 0.775, -0.071], turn: [-0.352, 0, -0.533], paint: "bone", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "rod", size: [0.006, 0.136, 0.012], at: [-0.074, 0.775, -0.119], turn: [-0.553, 0, 0.317], paint: "bone", swing: "sway", pivot: [0, 0.05, 0] },
        { shape: "rod", size: [0.006, 0.136, 0.012], at: [-0.124, 0.775, 0.066], turn: [0.328, 0, 0.546], paint: "bone", swing: "sway", pivot: [0, 0.05, 0] },
      ],
    },
  },
}
