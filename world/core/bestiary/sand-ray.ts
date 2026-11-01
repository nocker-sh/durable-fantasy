import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A flat diamond that slides just under the sand, leaving only its eyes and two short breathing tubes showing. */
export const draft: MonsterDraft = {
  home: "red-dunes",
  life: "砂の下にもぐる虫や小さなとかげを食べる。昼は砂に伏せて目と背中の管だけを出して休み、人が近づくと体のふちを波打たせて砂の中を滑っていく。",
  origin: "砂に伏せて待つ伏兵の兵器の子孫で、砂の下でも息ができる二本の短い管が背中に残った。",
  kind: {
    name: "砂えい",
    hp: 84,
    def: 4,
    flee: 14,
    atk: 11,
    hit: 17,
    exp: 38,
    respawn: 130,
    look: "figure",
    size: 1,
    drops: [
      { item: "raw-hide", chance: 0.55 },
      { item: "rusty-scrap", chance: 0.2 },
    ],
    figure: {
      palette: { hide: 0xb88a5e, belly: 0xd8bc94, dark: 0x6a4a34, accent: 0x7e4a32, bone: 0xd8ccb0 },
      parts: [
        { shape: "ball", size: [0.13, 0.06, 0.2], at: [0, 0.06, 0.01], paint: "hide" },
        { shape: "box", size: [0.36, 0.024, 0.36], at: [0, 0.03, 0], turn: [0, 0.785, 0], paint: "hide" },
        { shape: "box", size: [0.035, 0.006, 0.035], at: [-0.13, 0.044, 0.04], turn: [0, 0.5, 0], paint: "dark" },
        { shape: "box", size: [0.035, 0.006, 0.035], at: [0.12, 0.044, -0.06], turn: [0, 0.5, 0], paint: "dark" },
        { shape: "box", size: [0.035, 0.006, 0.035], at: [-0.06, 0.044, -0.15], turn: [0, 0.5, 0], paint: "dark" },
        { shape: "box", size: [0.035, 0.006, 0.035], at: [0.07, 0.044, 0.13], turn: [0, 0.5, 0], paint: "dark" },
        { shape: "box", size: [0.035, 0.006, 0.035], at: [0.19, 0.044, 0.03], turn: [0, 0.5, 0], paint: "dark" },
        { shape: "box", size: [0.035, 0.006, 0.035], at: [-0.2, 0.044, -0.02], turn: [0, 0.5, 0], paint: "dark" },
        { shape: "box", size: [0.13, 0.016, 0.13], at: [-0.25, 0.026, -0.01], turn: [0, 0.785, 0], paint: "hide", swing: "flap", pivot: [-0.2, 0.03, -0.01] },
        { shape: "box", size: [0.13, 0.016, 0.13], at: [0.25, 0.026, -0.01], turn: [0, -0.785, 0], paint: "hide", swing: "flap", pivot: [0.2, 0.03, -0.01] },
        { shape: "ball", size: [0.03, 0.028, 0.032], at: [-0.045, 0.095, 0.1], paint: "hide" },
        { shape: "ball", size: [0.03, 0.028, 0.032], at: [0.045, 0.095, 0.1], paint: "hide" },
        { shape: "box", size: [0.022, 0.022, 0.022], at: [-0.045, 0.118, 0.11], paint: "eye" },
        { shape: "box", size: [0.022, 0.022, 0.022], at: [0.045, 0.118, 0.11], paint: "eye" },
        { shape: "rod", size: [0.018, 0.105, 0.02], at: [-0.04, 0.14, -0.015], turn: [-0.291, 0, 0.095], paint: "accent" },
        { shape: "rod", size: [0.012, 0.007, 0.012], at: [-0.045, 0.19, -0.03], turn: [-0.291, 0, 0.095], paint: "dark" },
        { shape: "rod", size: [0.018, 0.105, 0.02], at: [0.04, 0.14, -0.015], turn: [-0.291, 0, -0.095], paint: "accent" },
        { shape: "rod", size: [0.012, 0.007, 0.012], at: [0.045, 0.19, -0.03], turn: [-0.291, 0, -0.095], paint: "dark" },
        { shape: "rod", size: [0.008, 0.46, 0.024], at: [0, 0.025, -0.41], turn: [-1.616, 0, 0], paint: "hide", swing: "wag", pivot: [0, 0.035, -0.18] },
        { shape: "cone", size: [0.016, 0.1, 4], at: [0, 0.014, -0.65], turn: [-1.611, 0, 0], paint: "bone", swing: "wag", pivot: [0, 0.035, -0.18] },
      ],
    },
  },
}
