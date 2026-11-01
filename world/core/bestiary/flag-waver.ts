import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** An upright cliff-top burrower that waves the broad flat flaps on its raised arms to warn its colony. */
export const draft: MonsterDraft = {
  home: "sea-cliff",
  life: "崖の上の草の種や、風で吹き寄せられた虫を食べる。崖の縁の巣穴の前に群れで立ち、人が近づくと腕の先の平たいひだを振って仲間に知らせ、そろって穴へ逃げこむ。",
  origin: "大戦で遠くの味方へ合図を送った生き物の兵器の子孫で、腕の先の旗のようなひだだけが残った。",
  kind: {
    name: "旗振り",
    hp: 90,
    def: 2,
    flee: 26,
    atk: 0,
    hit: 0,
    exp: 40,
    respawn: 150,
    look: "figure",
    size: 1.25,
    drops: [
      { item: "soft-fur", chance: 0.55 },
      { item: "raw-hide", chance: 0.2 },
    ],
    figure: {
      palette: { hide: 0x9a8a6c, belly: 0xd0c4a6, dark: 0x3c342a, accent: 0x9a5a40, bone: 0xd8ceb4, eye: 0x16141a },
      parts: [
        { shape: "ball", size: [0.075, 0.13, 0.07], at: [0, 0.2, 0], turn: [-0.1, 0, 0], paint: "hide" },
        { shape: "ball", size: [0.055, 0.1, 0.04], at: [0, 0.19, 0.04], turn: [-0.1, 0, 0], paint: "belly" },
        { shape: "ball", size: [0.062, 0.056, 0.066], at: [0, 0.37, 0.01], paint: "hide" },
        { shape: "box", size: [0.04, 0.034, 0.045], at: [0, 0.357, 0.07], paint: "belly" },
        { shape: "box", size: [0.02, 0.016, 0.012], at: [0, 0.366, 0.095], paint: "dark" },
        { shape: "box", size: [0.018, 0.018, 0.018], at: [-0.032, 0.388, 0.058], paint: "eye" },
        { shape: "ball", size: [0.018, 0.022, 0.01], at: [-0.048, 0.418, -0.005], paint: "dark" },
        { shape: "box", size: [0.018, 0.018, 0.018], at: [0.032, 0.388, 0.058], paint: "eye" },
        { shape: "ball", size: [0.018, 0.022, 0.01], at: [0.048, 0.418, -0.005], paint: "dark" },
        { shape: "ball", size: [0.04, 0.055, 0.06], at: [-0.052, 0.075, 0], paint: "hide", swing: "stride-a", pivot: [-0.05, 0.12, 0] },
        { shape: "box", size: [0.036, 0.016, 0.075], at: [-0.052, 0.008, 0.04], paint: "dark", swing: "stride-a", pivot: [-0.05, 0.12, 0] },
        { shape: "ball", size: [0.04, 0.055, 0.06], at: [0.052, 0.075, 0], paint: "hide", swing: "stride-b", pivot: [0.05, 0.12, 0] },
        { shape: "box", size: [0.036, 0.016, 0.075], at: [0.052, 0.008, 0.04], paint: "dark", swing: "stride-b", pivot: [0.05, 0.12, 0] },
        { shape: "rod", size: [0.01, 0.221, 0.026], at: [0, 0.053, -0.15], turn: [1.131, 0, -3.142], paint: "hide", swing: "wag", pivot: [0, 0.1, -0.05] },
        { shape: "rod", size: [0.013, 0.185, 0.018], at: [-0.105, 0.37, 0.03], turn: [0.095, 0.053, 0.51], paint: "hide", swing: "flap", pivot: [-0.06, 0.29, 0.02] },
        { shape: "box", size: [0.1, 0.13, 0.01], at: [-0.159, 0.365, 0.036], turn: [0.095, 0.053, 0.51], paint: "accent", swing: "flap", pivot: [-0.06, 0.29, 0.02] },
        { shape: "box", size: [0.024, 0.13, 0.012], at: [-0.211, 0.336, 0.036], turn: [0.095, 0.053, 0.51], paint: "bone", swing: "flap", pivot: [-0.06, 0.29, 0.02] },
        { shape: "rod", size: [0.013, 0.185, 0.018], at: [0.105, 0.37, 0.03], turn: [0.095, -0.053, -0.51], paint: "hide", swing: "flap", pivot: [0.06, 0.29, 0.02] },
        { shape: "box", size: [0.1, 0.13, 0.01], at: [0.159, 0.365, 0.036], turn: [0.095, -0.053, -0.51], paint: "accent", swing: "flap", pivot: [0.06, 0.29, 0.02] },
        { shape: "box", size: [0.024, 0.13, 0.012], at: [0.211, 0.336, 0.036], turn: [0.095, -0.053, -0.51], paint: "bone", swing: "flap", pivot: [0.06, 0.29, 0.02] },
      ],
    },
  },
}
