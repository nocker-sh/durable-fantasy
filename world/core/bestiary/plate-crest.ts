import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A plump ground bird that raises the round plate on its head to warn its flock, the last of a wartime marker bird. */
export const draft: MonsterDraft = {
  home: "south-meadow",
  life: "草の種や小さな虫をついばみ、草むらのくぼみに巣を作って休む。人が近づくと頭の板を立てて仲間に見せ、群れごと走って逃げる。",
  origin: "大戦で敵と味方を見分けるために頭に板をつけられた鳥の子孫。頭の上の硬い丸い板が残った。",
  kind: {
    name: "板かむり",
    hp: 18,
    def: 1,
    flee: 26,
    atk: 0,
    hit: 0,
    exp: 7,
    respawn: 130,
    look: "figure",
    size: 1.15,
    drops: [
      { item: "feather", chance: 0.65 },
      { item: "old-bone", chance: 0.1 },
    ],
    figure: {
      palette: { hide: 0x8a7a62, belly: 0xcfc2a4, dark: 0x4a4036, accent: 0x6c7884, bone: 0xc89a5a },
      parts: [
        { shape: "ball", size: [0.09, 0.085, 0.12], at: [0, 0.17, -0.01], paint: "hide" },
        { shape: "ball", size: [0.07, 0.065, 0.065], at: [0, 0.15, 0.06], paint: "belly" },
        { shape: "box", size: [0.075, 0.016, 0.1], at: [0, 0.22, -0.15], turn: [0.55, 0, 0], paint: "dark", swing: "wag", pivot: [0, 0.2, -0.1] },
        { shape: "box", size: [0.022, 0.075, 0.12], at: [-0.088, 0.18, -0.03], turn: [0.2, 0, -0.12], paint: "dark", swing: "flap", pivot: [-0.08, 0.22, -0.03] },
        { shape: "rod", size: [0.011, 0.101, 0.009], at: [-0.038, 0.06, 0.008], turn: [0, -1.893, 0.157], paint: "bone", swing: "stride-a", pivot: [-0.035, 0.11, 0] },
        { shape: "box", size: [0.035, 0.012, 0.055], at: [-0.04, 0.006, 0.035], paint: "bone", swing: "stride-a", pivot: [-0.035, 0.11, 0] },
        { shape: "box", size: [0.022, 0.075, 0.12], at: [0.088, 0.18, -0.03], turn: [0.2, 0, 0.12], paint: "dark", swing: "flap", pivot: [0.08, 0.22, -0.03] },
        { shape: "rod", size: [0.011, 0.101, 0.009], at: [0.038, 0.06, 0.008], turn: [0, -1.249, 0.157], paint: "bone", swing: "stride-b", pivot: [0.035, 0.11, 0] },
        { shape: "box", size: [0.035, 0.012, 0.055], at: [0.04, 0.006, 0.035], paint: "bone", swing: "stride-b", pivot: [0.035, 0.11, 0] },
        { shape: "ball", size: [0.055, 0.055, 0.055], at: [0, 0.27, 0.1], paint: "hide", swing: "nod", pivot: [0, 0.22, 0.07] },
        { shape: "cone", size: [0.018, 0.05, 4], at: [0, 0.262, 0.17], turn: [1.571, 0, 0], paint: "bone", swing: "nod", pivot: [0, 0.22, 0.07] },
        { shape: "box", size: [0.016, 0.016, 0.016], at: [-0.045, 0.285, 0.122], paint: "eye", swing: "nod", pivot: [0, 0.22, 0.07] },
        { shape: "box", size: [0.016, 0.016, 0.016], at: [0.045, 0.285, 0.122], paint: "eye", swing: "nod", pivot: [0, 0.22, 0.07] },
        { shape: "rod", size: [0.108, 0.016, 0.108], at: [0, 0.365, 0.078], turn: [1.571, 0, 0], paint: "accent", swing: "nod", pivot: [0, 0.22, 0.07] },
        { shape: "rod", size: [0.045, 0.016, 0.045], at: [0, 0.365, 0.082], turn: [1.571, 0, 0], paint: "belly", swing: "nod", pivot: [0, 0.22, 0.07] },
      ],
    },
  },
}
