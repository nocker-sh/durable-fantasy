import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A heavy seal-like loafer that lies about outside the port, a ring of hard plates round its neck. */
export const draft: MonsterDraft = {
  home: "quynhon-gate",
  life: "港から流れてくる魚の頭や骨を浜で拾って食べる。門前の日の当たる岩や石畳に寝そべって休み、人が近づいても片目を開けるだけで動かない。",
  origin: "大戦で港に入る船へ体当たりした生き物の兵器の子孫で、首のまわりの硬い板の輪だけが残った。",
  kind: {
    name: "首輪あざらし",
    hp: 260,
    def: 10,
    flee: 2,
    atk: 22,
    hit: 32,
    exp: 124,
    respawn: 200,
    look: "figure",
    size: 1.35,
    drops: [
      { item: "raw-hide", chance: 0.6 },
      { item: "hard-shell", chance: 0.3 },
    ],
    figure: {
      palette: { hide: 0x7a7468, belly: 0xb8ae98, dark: 0x3a3630, accent: 0x55575a, eye: 0x141418 },
      parts: [
        { shape: "ball", size: [0.17, 0.13, 0.34], at: [0, 0.13, -0.06], paint: "hide" },
        { shape: "ball", size: [0.14, 0.07, 0.28], at: [0, 0.07, -0.04], paint: "belly" },
        { shape: "ball", size: [0.13, 0.13, 0.13], at: [0, 0.2, 0.18], paint: "hide" },
        { shape: "ball", size: [0.03, 0.012, 0.03], at: [0.06, 0.25, -0.05], paint: "dark" },
        { shape: "ball", size: [0.03, 0.012, 0.03], at: [-0.08, 0.235, -0.16], paint: "dark" },
        { shape: "ball", size: [0.03, 0.012, 0.03], at: [0.03, 0.215, -0.27], paint: "dark" },
        { shape: "rod", size: [0.118, 0.075, 0.138], at: [0, 0.29, 0.24], turn: [0.55, 0, 0], paint: "accent" },
        { shape: "rod", size: [0.142, 0.016, 0.142], at: [0, 0.258, 0.22], turn: [0.55, 0, 0], paint: "dark" },
        { shape: "ball", size: [0.06, 0.07, 0.06], at: [0, 0.35, 0.27], paint: "hide", swing: "nod", pivot: [0, 0.3, 0.25] },
        { shape: "ball", size: [0.09, 0.085, 0.1], at: [0, 0.42, 0.3], paint: "hide", swing: "nod", pivot: [0, 0.3, 0.25] },
        { shape: "ball", size: [0.055, 0.045, 0.06], at: [0, 0.395, 0.39], paint: "belly", swing: "nod", pivot: [0, 0.3, 0.25] },
        { shape: "box", size: [0.032, 0.022, 0.016], at: [0, 0.412, 0.448], paint: "dark", swing: "nod", pivot: [0, 0.3, 0.25] },
        { shape: "box", size: [0.02, 0.02, 0.02], at: [-0.052, 0.45, 0.36], paint: "eye", swing: "nod", pivot: [0, 0.3, 0.25] },
        { shape: "box", size: [0.02, 0.02, 0.02], at: [0.052, 0.45, 0.36], paint: "eye", swing: "nod", pivot: [0, 0.3, 0.25] },
        { shape: "box", size: [0.07, 0.168, 0.03], at: [-0.175, 0.056, 0.17], turn: [-1.319, -0.495, 2.067], paint: "hide", swing: "stride-a", pivot: [-0.11, 0.1, 0.14] },
        { shape: "box", size: [0.08, 0.016, 0.07], at: [-0.26, 0.008, 0.21], turn: [0, 0.4, 0], paint: "dark", swing: "stride-a", pivot: [-0.11, 0.1, 0.14] },
        { shape: "box", size: [0.07, 0.168, 0.03], at: [0.175, 0.056, 0.17], turn: [-1.319, 0.495, -2.067], paint: "hide", swing: "stride-b", pivot: [0.11, 0.1, 0.14] },
        { shape: "box", size: [0.08, 0.016, 0.07], at: [0.26, 0.008, 0.21], turn: [0, -0.4, 0], paint: "dark", swing: "stride-b", pivot: [0.11, 0.1, 0.14] },
        { shape: "box", size: [0.075, 0.02, 0.15], at: [-0.06, 0.025, -0.46], turn: [0, -0.35, 0], paint: "dark", swing: "wag", pivot: [0, 0.05, -0.36] },
        { shape: "box", size: [0.075, 0.02, 0.15], at: [0.06, 0.025, -0.46], turn: [0, 0.35, 0], paint: "dark", swing: "wag", pivot: [0, 0.05, -0.36] },
      ],
    },
  },
}
