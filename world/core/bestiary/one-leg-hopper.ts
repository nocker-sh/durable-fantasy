import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** An upright egg-shaped hopper on a single coiled leg with a long propping tail, the last of a wartime leaping charge. */
export const draft: MonsterDraft = {
  home: "south-meadow",
  life: "草むらのバッタに跳びついて捕まえて食べ、夜は石垣のすき間で休む。人が近づくと跳ねて間をあけ、叩かれると太い脚で蹴り返す。",
  origin: "大戦で敵の陣へ跳びこむために作られた兵器の子孫。ばねのように縮む一本の太い脚が残った。",
  kind: {
    name: "片足跳ね",
    hp: 28,
    def: 0,
    flee: 16,
    atk: 4,
    hit: 8,
    exp: 10,
    respawn: 110,
    look: "figure",
    size: 1.15,
    drops: [
      { item: "soft-fur", chance: 0.45 },
      { item: "raw-hide", chance: 0.12 },
    ],
    figure: {
      palette: { hide: 0x9a8a5a, belly: 0xd6cca8, dark: 0x4a4430, accent: 0x7a6a44 },
      parts: [
        { shape: "ball", size: [0.075, 0.1, 0.075], at: [0, 0.28, 0], turn: [0.25, 0, 0], paint: "hide" },
        { shape: "ball", size: [0.052, 0.07, 0.04], at: [0, 0.26, 0.04], turn: [0.25, 0, 0], paint: "belly" },
        { shape: "box", size: [0.016, 0.016, 0.016], at: [-0.034, 0.335, 0.06], paint: "eye" },
        { shape: "box", size: [0.016, 0.016, 0.016], at: [0.034, 0.335, 0.06], paint: "eye" },
        { shape: "rod", size: [0.004, 0.198, 0.008], at: [-0.054, 0.455, 0.07], turn: [0, 0.904, 0.54], paint: "dark", swing: "sway", pivot: [-0.022, 0.37, 0.03] },
        { shape: "box", size: [0.016, 0.059, 0.016], at: [-0.053, 0.225, 0.075], turn: [0, -1.736, 0.546], paint: "hide" },
        { shape: "rod", size: [0.004, 0.198, 0.008], at: [0.054, 0.455, 0.07], turn: [0, 2.238, 0.54], paint: "dark", swing: "sway", pivot: [0.022, 0.37, 0.03] },
        { shape: "box", size: [0.016, 0.059, 0.016], at: [0.053, 0.225, 0.075], turn: [0, -1.406, 0.546], paint: "hide" },
        { shape: "rod", size: [0.045, 0.118, 0.032], at: [0, 0.165, 0.038], turn: [0, -1.571, 0.936], paint: "hide", swing: "stride-a", pivot: [0, 0.2, -0.01] },
        { shape: "rod", size: [0.022, 0.163, 0.018], at: [0, 0.078, 0.023], turn: [0, 1.571, 0.872], paint: "accent", swing: "stride-a", pivot: [0, 0.2, -0.01] },
        { shape: "rod", size: [0.026, 0.014, 0.026], at: [0, 0.093, 0.041], paint: "dark", swing: "stride-a", pivot: [0, 0.2, -0.01] },
        { shape: "rod", size: [0.026, 0.014, 0.026], at: [0, 0.067, 0.01], paint: "dark", swing: "stride-a", pivot: [0, 0.2, -0.01] },
        { shape: "box", size: [0.05, 0.024, 0.15], at: [0, 0.012, 0.025], paint: "accent", swing: "stride-a", pivot: [0, 0.2, -0.01] },
        { shape: "rod", size: [0.03, 0.184, 0.02], at: [0, 0.15, -0.13], turn: [0, 1.571, 0.862], paint: "hide", swing: "wag", pivot: [0, 0.21, -0.06] },
        { shape: "rod", size: [0.02, 0.127, 0.01], at: [0, 0.051, -0.25], turn: [0, 1.571, 0.908], paint: "hide", swing: "wag", pivot: [0, 0.21, -0.06] },
      ],
    },
  },
}
