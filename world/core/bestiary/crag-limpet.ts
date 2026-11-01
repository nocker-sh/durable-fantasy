import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A wide hat-shelled rock-clinger with a ring of rivet knobs, the last of a wartime living wall-shield. */
export const draft: MonsterDraft = {
  home: "mountain-pass",
  life: "崖や道ばたの岩に貼りつき、岩の表の苔や地衣をゆっくり削って食べる。夜は岩の割れ目で休み、人が触れると殻を岩に押しつけて動かなくなるが、叩かれると殻の縁で手を挟む。",
  origin: "大戦で砦の壁に貼りつけて使った、生きた盾の子孫。殻の縁に鋲のような粒が並んで残っている。",
  kind: {
    name: "岩笠",
    hp: 90,
    def: 10,
    flee: 2,
    atk: 5,
    hit: 12,
    exp: 34,
    respawn: 160,
    look: "figure",
    size: 1.25,
    drops: [
      { item: "hard-shell", chance: 0.6 },
      { item: "rusty-scrap", chance: 0.12 },
    ],
    figure: {
      palette: { hide: 0x857a6a, belly: 0x9a8070, dark: 0x4a4440, accent: 0x7d8a58, bone: 0xc8bea4, eye: 0x1a1612 },
      parts: [
        { shape: "rod", size: [0.25, 0.05, 0.27], at: [0, 0.025, 0], paint: "belly", swing: "pulse", pivot: [0, 0, 0] },
        { shape: "cone", size: [0.3, 0.26, 9], at: [0, 0.18, -0.02], turn: [-0.12, 0, 0], paint: "hide" },
        { shape: "rod", size: [0.3, 0.04, 0.31], at: [0, 0.055, 0], paint: "hide" },
        { shape: "box", size: [0.1, 0.05, 0.08], at: [-0.12, 0.15, -0.08], turn: [0.35, 0.4, 0.6], paint: "accent" },
        { shape: "box", size: [0.08, 0.05, 0.07], at: [0.1, 0.16, 0.07], turn: [-0.4, 0.2, -0.6], paint: "accent" },
        { shape: "rod", size: [0.03, 0.03, 0.04], at: [0, 0.31, -0.05], paint: "dark" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [0.08, 0.085, 0.258], turn: [0, 0.3, 0], paint: "bone" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [0.216, 0.085, 0.162], turn: [0, 0.928, 0], paint: "bone" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [0.27, 0.085, 0.004], turn: [0, 1.557, 0], paint: "bone" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [0.221, 0.085, -0.156], turn: [0, 2.185, 0], paint: "bone" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [0.087, 0.085, -0.256], turn: [0, 2.813, 0], paint: "bone" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [-0.08, 0.085, -0.258], turn: [0, 3.442, 0], paint: "bone" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [-0.216, 0.085, -0.162], turn: [0, 4.07, 0], paint: "bone" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [-0.27, 0.085, -0.004], turn: [0, 4.698, 0], paint: "bone" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [-0.221, 0.085, 0.156], turn: [0, 5.327, 0], paint: "bone" },
        { shape: "box", size: [0.035, 0.03, 0.035], at: [-0.087, 0.085, 0.256], turn: [0, 5.955, 0], paint: "bone" },
        { shape: "rod", size: [0.01, 0.168, 0.014], at: [0.08, 0.11, 0.305], turn: [0.742, 0, -0.241], paint: "belly", swing: "sway", pivot: [0.06, 0.05, 0.25] },
        { shape: "box", size: [0.026, 0.026, 0.026], at: [0.1, 0.17, 0.36], paint: "eye", swing: "sway", pivot: [0.06, 0.05, 0.25] },
        { shape: "rod", size: [0.01, 0.168, 0.014], at: [-0.08, 0.11, 0.305], turn: [0.742, 0, 0.241], paint: "belly", swing: "sway", pivot: [-0.06, 0.05, 0.25] },
        { shape: "box", size: [0.026, 0.026, 0.026], at: [-0.1, 0.17, 0.36], paint: "eye", swing: "sway", pivot: [-0.06, 0.05, 0.25] },
      ],
    },
  },
}
