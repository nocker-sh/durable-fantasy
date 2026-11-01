import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A goby that props itself up on two fin-arms on the tide flats, keeping a stiff plate fin on its back. */
export const draft: MonsterDraft = {
  home: "net-sheds",
  life: "干潟の泥にいる小さなエビやゴカイを食べる。潮が引くと網小屋の下の濡れた泥で休み、人が近づくと胸びれで跳ねて水たまりへ逃げる。",
  origin: "大戦で浜へ上がるのに使われた水陸の兵器の子孫で、背中の硬い板びれだけが残った。",
  kind: {
    name: "歩きはぜ",
    hp: 38,
    def: 1,
    flee: 16,
    atk: 0,
    hit: 0,
    exp: 13,
    respawn: 110,
    look: "figure",
    size: 1.3,
    drops: [
      { item: "raw-hide", chance: 0.45 },
      { item: "hard-shell", chance: 0.12 },
    ],
    figure: {
      palette: { hide: 0x6b6650, belly: 0xc4b898, dark: 0x3c3a30, accent: 0x5e6870, eye: 0x16161a },
      parts: [
        { shape: "ball", size: [0.085, 0.075, 0.17], at: [0, 0.1, -0.03], turn: [-0.2, 0, 0], paint: "hide" },
        { shape: "ball", size: [0.07, 0.045, 0.13], at: [0, 0.065, -0.01], paint: "belly" },
        { shape: "ball", size: [0.082, 0.072, 0.088], at: [0, 0.15, 0.13], paint: "hide" },
        { shape: "ball", size: [0.06, 0.035, 0.05], at: [0, 0.11, 0.19], paint: "belly" },
        { shape: "ball", size: [0.03, 0.03, 0.03], at: [-0.038, 0.215, 0.15], paint: "hide" },
        { shape: "box", size: [0.026, 0.026, 0.026], at: [-0.04, 0.232, 0.168], paint: "eye" },
        { shape: "ball", size: [0.03, 0.03, 0.03], at: [0.038, 0.215, 0.15], paint: "hide" },
        { shape: "box", size: [0.026, 0.026, 0.026], at: [0.04, 0.232, 0.168], paint: "eye" },
        { shape: "box", size: [0.014, 0.11, 0.16], at: [0, 0.205, -0.05], turn: [0.18, 0, 0], paint: "accent" },
        { shape: "box", size: [0.02, 0.012, 0.17], at: [0, 0.262, -0.06], turn: [0.18, 0, 0], paint: "dark" },
        { shape: "rod", size: [0.014, 0.221, 0.058], at: [0, 0.055, -0.255], turn: [1.249, 0, -3.142], paint: "hide" },
        { shape: "box", size: [0.012, 0.075, 0.1], at: [0, 0.04, -0.4], paint: "dark", swing: "wag", pivot: [0, 0.04, -0.35] },
        { shape: "box", size: [0.032, 0.128, 0.022], at: [-0.103, 0.052, 0.115], turn: [-0.437, 0.395, 2.452], paint: "hide", swing: "stride-a", pivot: [-0.065, 0.09, 0.08] },
        { shape: "box", size: [0.075, 0.012, 0.065], at: [-0.155, 0.006, 0.17], turn: [0, -0.35, 0], paint: "dark", swing: "stride-a", pivot: [-0.065, 0.09, 0.08] },
        { shape: "box", size: [0.032, 0.128, 0.022], at: [0.103, 0.052, 0.115], turn: [-0.437, -0.395, -2.452], paint: "hide", swing: "stride-b", pivot: [0.065, 0.09, 0.08] },
        { shape: "box", size: [0.075, 0.012, 0.065], at: [0.155, 0.006, 0.17], turn: [0, 0.35, 0], paint: "dark", swing: "stride-b", pivot: [0.065, 0.09, 0.08] },
        { shape: "box", size: [0.05, 0.01, 0.045], at: [-0.06, 0.03, -0.06], turn: [0, 0, -0.3], paint: "dark" },
        { shape: "box", size: [0.05, 0.01, 0.045], at: [0.06, 0.03, -0.06], turn: [0, 0, 0.3], paint: "dark" },
      ],
    },
  },
}
