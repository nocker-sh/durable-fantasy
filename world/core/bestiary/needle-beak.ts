import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A round, wingless ground bird with a long thin beak it pushes into moss, from a wartime armour-piercing bird. */
export const draft: MonsterDraft = {
  home: "forest-edge",
  life: "細いくちばしを苔や落ち葉の下へ差しこんで、ミミズや虫の子を探して食べる。木の根の窪みに枯れ葉を集めて眠り、人が近づくと短い脚で走って茂みに隠れる。",
  origin: "大戦で鎧の隙間を突くために作られた鳥の子孫。翼は小さくなって飛べず、針のように細く硬いくちばしだけが残った。",
  kind: {
    name: "針くちばし",
    hp: 48,
    def: 1,
    flee: 24,
    atk: 5,
    hit: 14,
    exp: 20,
    respawn: 120,
    look: "figure",
    size: 1.35,
    drops: [
      { item: "feather", chance: 0.65 },
      { item: "sharp-fang", chance: 0.15 },
    ],
    figure: {
      palette: { hide: 0x6e5a46, belly: 0x9a8468, dark: 0x3a3028, accent: 0x4e4438, bone: 0xc4b08a },
      parts: [
        { shape: "ball", size: [0.12, 0.11, 0.13], at: [0, 0.24, -0.01], paint: "hide" },
        { shape: "ball", size: [0.09, 0.07, 0.08], at: [0, 0.2, 0.05], paint: "belly" },
        { shape: "ball", size: [0.06, 0.055, 0.065], at: [0, 0.34, 0.11], paint: "hide", swing: "nod", pivot: [0, 0.31, 0.06] },
        { shape: "rod", size: [0.012, 0.341, 0.004], at: [0, 0.2, 0.27], turn: [-0.702, 0, 0], paint: "bone", swing: "nod", pivot: [0, 0.31, 0.06] },
        { shape: "box", size: [0.02, 0.02, 0.02], at: [-0.045, 0.36, 0.14], paint: "eye", swing: "nod", pivot: [0, 0.31, 0.06] },
        { shape: "box", size: [0.02, 0.02, 0.02], at: [0.045, 0.36, 0.14], paint: "eye", swing: "nod", pivot: [0, 0.31, 0.06] },
        { shape: "cone", size: [0.02, 0.095, 4], at: [0, 0.405, 0.045], turn: [-1.249, 0, 0], paint: "accent", swing: "nod", pivot: [0, 0.31, 0.06] },
        { shape: "ball", size: [0.025, 0.05, 0.075], at: [-0.115, 0.25, -0.02], paint: "accent", swing: "flap", pivot: [-0.1, 0.29, -0.02] },
        { shape: "ball", size: [0.025, 0.05, 0.075], at: [0.115, 0.25, -0.02], paint: "accent", swing: "flap", pivot: [0.1, 0.29, -0.02] },
        { shape: "box", size: [0.1, 0.018, 0.1], at: [0, 0.29, -0.17], turn: [-0.6, 0, 0], paint: "accent", swing: "wag", pivot: [0, 0.25, -0.12] },
        { shape: "rod", size: [0.018, 0.095, 0.014], at: [-0.053, 0.115, -0.025], turn: [0.322, 0, -0.053], paint: "dark", swing: "stride-a", pivot: [-0.05, 0.16, -0.01] },
        { shape: "rod", size: [0.012, 0.071, 0.01], at: [-0.056, 0.041, -0.02], turn: [-0.604, 0, -0.043], paint: "dark", swing: "stride-a", pivot: [-0.05, 0.16, -0.01] },
        { shape: "box", size: [0.05, 0.012, 0.06], at: [-0.058, 0.006, 0.02], paint: "dark", swing: "stride-a", pivot: [-0.05, 0.16, -0.01] },
        { shape: "rod", size: [0.018, 0.095, 0.014], at: [0.053, 0.115, -0.025], turn: [0.322, 0, 0.053], paint: "dark", swing: "stride-b", pivot: [0.05, 0.16, -0.01] },
        { shape: "rod", size: [0.012, 0.071, 0.01], at: [0.057, 0.041, -0.02], turn: [-0.604, 0, 0.043], paint: "dark", swing: "stride-b", pivot: [0.05, 0.16, -0.01] },
        { shape: "box", size: [0.05, 0.012, 0.06], at: [0.058, 0.006, 0.02], paint: "dark", swing: "stride-b", pivot: [0.05, 0.16, -0.01] },
      ],
    },
  },
}
