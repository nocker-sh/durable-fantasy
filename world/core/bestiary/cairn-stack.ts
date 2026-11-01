import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A slow creature that carries a stack of flat stone-like plates on its back and is often taken for a cairn by the road, the last of a wartime armour bearer. */
export const draft: MonsterDraft = {
  home: "mountain-pass",
  life: "岩についた苔や地衣をなめて食べる。道ばたで脚をしまってじっと休むので旅人に石積みの道しるべと間違えられ、人が近づいても動かないが、叩かれると体を揺すって押し返す。",
  origin: "大戦で重ねた板を背負って兵の盾になった生き物の子孫。背に重なった平たい板が残った。",
  kind: {
    name: "積み石",
    hp: 140,
    def: 12,
    flee: 2,
    atk: 9,
    hit: 18,
    exp: 52,
    respawn: 180,
    look: "figure",
    size: 1.15,
    drops: [
      { item: "hard-shell", chance: 0.55 },
      { item: "herb", chance: 0.15 },
    ],
    figure: {
      palette: { hide: 0x8a867c, belly: 0x9a8a78, dark: 0x3a3430, accent: 0x6e7a4e, bone: 0xb4aa98, eye: 0x14100c },
      parts: [
        { shape: "ball", size: [0.17, 0.07, 0.15], at: [0, 0.1, 0], paint: "belly" },
        { shape: "rod", size: [0.03, 0.08, 0.026], at: [0.13, 0.045, 0.09], paint: "belly", swing: "stride-a", pivot: [0.12, 0.09, 0.09] },
        { shape: "rod", size: [0.03, 0.08, 0.026], at: [-0.13, 0.045, 0.09], paint: "belly", swing: "stride-b", pivot: [-0.12, 0.09, 0.09] },
        { shape: "box", size: [0.05, 0.02, 0.06], at: [0.132, 0.01, 0.1], paint: "dark", swing: "stride-a", pivot: [0.12, 0.09, 0.09] },
        { shape: "box", size: [0.05, 0.02, 0.06], at: [-0.132, 0.01, 0.1], paint: "dark", swing: "stride-b", pivot: [-0.12, 0.09, 0.09] },
        { shape: "rod", size: [0.03, 0.08, 0.026], at: [0.13, 0.045, -0.09], paint: "belly", swing: "stride-b", pivot: [0.12, 0.09, -0.09] },
        { shape: "rod", size: [0.03, 0.08, 0.026], at: [-0.13, 0.045, -0.09], paint: "belly", swing: "stride-a", pivot: [-0.12, 0.09, -0.09] },
        { shape: "box", size: [0.05, 0.02, 0.06], at: [0.132, 0.01, -0.08], paint: "dark", swing: "stride-b", pivot: [0.12, 0.09, -0.09] },
        { shape: "box", size: [0.05, 0.02, 0.06], at: [-0.132, 0.01, -0.08], paint: "dark", swing: "stride-a", pivot: [-0.12, 0.09, -0.09] },
        { shape: "ball", size: [0.06, 0.05, 0.065], at: [0, 0.095, 0.22], paint: "belly", swing: "nod", pivot: [0, 0.1, 0.15] },
        { shape: "box", size: [0.016, 0.016, 0.014], at: [0.035, 0.11, 0.275], paint: "eye", swing: "nod", pivot: [0, 0.1, 0.15] },
        { shape: "box", size: [0.016, 0.016, 0.014], at: [-0.035, 0.11, 0.275], paint: "eye", swing: "nod", pivot: [0, 0.1, 0.15] },
        { shape: "ball", size: [0.25, 0.065, 0.22], at: [0, 0.17, -0.01], turn: [0.04, 0.3, 0], paint: "hide" },
        { shape: "ball", size: [0.205, 0.06, 0.18], at: [0.02, 0.27, -0.02], turn: [-0.06, -0.4, 0.07], paint: "bone" },
        { shape: "ball", size: [0.16, 0.058, 0.145], at: [-0.015, 0.36, 0], turn: [0.05, 0.9, -0.08], paint: "hide" },
        { shape: "ball", size: [0.115, 0.05, 0.1], at: [0.01, 0.445, -0.01], turn: [-0.08, 0.2, 0.06], paint: "bone" },
        { shape: "ball", size: [0.065, 0.05, 0.06], at: [0, 0.51, 0], turn: [0, 0.5, 0.1], paint: "hide", swing: "sway", pivot: [0, 0.47, 0] },
        { shape: "box", size: [0.08, 0.03, 0.05], at: [-0.17, 0.22, 0.06], turn: [0, 0.4, 0.3], paint: "accent" },
        { shape: "box", size: [0.06, 0.03, 0.05], at: [0.14, 0.32, -0.08], turn: [0, -0.3, -0.3], paint: "accent" },
        { shape: "cone", size: [0.03, 0.08, 5], at: [0, 0.07, -0.19], turn: [-1.9, 0, 0], paint: "belly", swing: "wag", pivot: [0, 0.08, -0.15] },
      ],
    },
  },
}
