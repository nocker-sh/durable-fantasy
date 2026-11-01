import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A rain snail whose coiled shell ends in a flared trumpet mouth that hums, the last of a wartime signal horn. */
export const draft: MonsterDraft = {
  home: "south-meadow",
  life: "雨のあとに水たまりのまわりへ出てきて、濡れた草や落ち葉を食べる。晴れた日は石の下で休み、人が近づくと殻にこもって殻の口から低い音を鳴らす。",
  origin: "大戦で合図の音を鳴らした角笛の兵器の子孫。らっぱのように開いた殻の口が残った。",
  kind: {
    name: "らっぱまいまい",
    hp: 30,
    def: 3,
    flee: 2,
    atk: 0,
    hit: 0,
    exp: 9,
    respawn: 150,
    look: "figure",
    size: 1.2,
    drops: [
      { item: "hard-shell", chance: 0.4 },
      { item: "jelly", chance: 0.3 },
    ],
    figure: {
      palette: { hide: 0xc8b890, belly: 0x9c9686, dark: 0x3e3830, accent: 0x8a6a4a, bone: 0xb09868 },
      parts: [
        { shape: "ball", size: [0.056, 0.03, 0.17], at: [0, 0.028, 0.01], paint: "belly" },
        { shape: "ball", size: [0.04, 0.05, 0.045], at: [0, 0.065, 0.135], paint: "belly", swing: "nod", pivot: [0, 0.05, 0.1] },
        { shape: "rod", size: [0.006, 0.107, 0.009], at: [-0.028, 0.15, 0.165], turn: [0, 0.896, 0.367], paint: "belly", swing: "nod", pivot: [0, 0.05, 0.1] },
        { shape: "box", size: [0.02, 0.02, 0.02], at: [-0.04, 0.2, 0.18], paint: "eye", swing: "nod", pivot: [0, 0.05, 0.1] },
        { shape: "rod", size: [0.005, 0.044, 0.008], at: [-0.023, 0.04, 0.188], turn: [0, 1.096, 2.041], paint: "belly", swing: "nod", pivot: [0, 0.05, 0.1] },
        { shape: "rod", size: [0.006, 0.107, 0.009], at: [0.028, 0.15, 0.165], turn: [0, 2.246, 0.367], paint: "belly", swing: "nod", pivot: [0, 0.05, 0.1] },
        { shape: "box", size: [0.02, 0.02, 0.02], at: [0.04, 0.2, 0.18], paint: "eye", swing: "nod", pivot: [0, 0.05, 0.1] },
        { shape: "rod", size: [0.005, 0.044, 0.008], at: [0.023, 0.04, 0.188], turn: [0, 2.046, 2.041], paint: "belly", swing: "nod", pivot: [0, 0.05, 0.1] },
        { shape: "ball", size: [0.062, 0.105, 0.105], at: [0, 0.15, -0.035], paint: "hide" },
        { shape: "rod", size: [0.08, 0.13, 0.08], at: [0, 0.15, -0.035], turn: [0, 0, 1.571], paint: "accent" },
        { shape: "rod", size: [0.054, 0.142, 0.054], at: [0, 0.15, -0.035], turn: [0, 0, 1.571], paint: "hide" },
        { shape: "rod", size: [0.028, 0.154, 0.028], at: [0, 0.15, -0.035], turn: [0, 0, 1.571], paint: "accent" },
        { shape: "rod", size: [0.022, 0.069, 0.028], at: [0, 0.198, -0.12], turn: [0, -1.571, 1.043], paint: "bone" },
        { shape: "rod", size: [0.07, 0.075, 0.022], at: [0, 0.227, -0.175], turn: [0, -1.571, 0.927], paint: "bone", swing: "pulse", pivot: [0, 0.212, -0.15] },
        { shape: "rod", size: [0.058, 0.006, 0.058], at: [0, 0.251, -0.206], turn: [0, -1.571, 0.896], paint: "dark", swing: "pulse", pivot: [0, 0.212, -0.15] },
      ],
    },
  },
}
