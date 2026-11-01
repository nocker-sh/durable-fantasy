import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A slow beetle with a lit sac under its tail, the last of a wartime night-signal swarm. */
export const draft: MonsterDraft = {
  home: "deep-forest",
  life: "朽木の樹液と落ちた実をなめる。日中は倒木の下で休み、夕方から腹の袋を光らせて仲間と寄り合う。人が近づくと光を消してじっとする。",
  origin: "大戦で夜の合図に使われた光る虫の群れの子孫。光る袋だけが残った。",
  kind: {
    name: "灯り甲虫",
    hp: 64,
    def: 6,
    flee: 6,
    atk: 6,
    hit: 12,
    interval: 2600,
    exp: 26,
    respawn: 150,
    look: "figure",
    size: 1.1,
    drops: [
      { item: "hard-shell", chance: 0.6 },
      { item: "sticky-thread", chance: 0.2 },
    ],
    figure: {
      palette: { hide: 0x3c4a3a, belly: 0x2a2a26, dark: 0x1e2220, glow: 0xe8d890, accent: 0x5a6a48 },
      parts: [
        { shape: "ball", size: [0.15, 0.09, 0.19], at: [0, 0.12, -0.02], paint: "hide" },
        { shape: "box", size: [0.012, 0.02, 0.3], at: [0, 0.205, -0.02], paint: "dark" },
        { shape: "ball", size: [0.07, 0.055, 0.06], at: [0, 0.1, 0.17], paint: "accent" },
        { shape: "box", size: [0.02, 0.02, 0.02], at: [-0.04, 0.12, 0.22], paint: "eye" },
        { shape: "box", size: [0.02, 0.02, 0.02], at: [0.04, 0.12, 0.22], paint: "eye" },
        { shape: "rod", size: [0.004, 0.12, 0.006], at: [-0.03, 0.17, 0.25], turn: [0.9, 0, 0.3], paint: "dark", swing: "sway", pivot: [-0.03, 0.13, 0.21] },
        { shape: "rod", size: [0.004, 0.12, 0.006], at: [0.03, 0.17, 0.25], turn: [0.9, 0, -0.3], paint: "dark", swing: "sway", pivot: [0.03, 0.13, 0.21] },
        { shape: "ball", size: [0.08, 0.06, 0.08], at: [0, 0.09, -0.2], paint: "glow", swing: "pulse", pivot: [0, 0.09, -0.2] },
        { shape: "box", size: [0.14, 0.015, 0.02], at: [-0.12, 0.05, 0.08], turn: [0, 0, -0.6], paint: "dark", swing: "stride-a", pivot: [-0.08, 0.09, 0.08] },
        { shape: "box", size: [0.14, 0.015, 0.02], at: [0.12, 0.05, 0.08], turn: [0, 0, 0.6], paint: "dark", swing: "stride-b", pivot: [0.08, 0.09, 0.08] },
        { shape: "box", size: [0.15, 0.015, 0.02], at: [-0.13, 0.05, -0.02], turn: [0, 0, -0.6], paint: "dark", swing: "stride-b", pivot: [-0.08, 0.09, -0.02] },
        { shape: "box", size: [0.15, 0.015, 0.02], at: [0.13, 0.05, -0.02], turn: [0, 0, 0.6], paint: "dark", swing: "stride-a", pivot: [0.08, 0.09, -0.02] },
        { shape: "box", size: [0.14, 0.015, 0.02], at: [-0.12, 0.05, -0.12], turn: [0, 0, -0.6], paint: "dark", swing: "stride-a", pivot: [-0.08, 0.09, -0.12] },
        { shape: "box", size: [0.14, 0.015, 0.02], at: [0.12, 0.05, -0.12], turn: [0, 0, 0.6], paint: "dark", swing: "stride-b", pivot: [0.08, 0.09, -0.12] },
      ],
    },
  },
}
