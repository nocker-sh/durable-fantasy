import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A long-legged spider of the deep forest, drawn from a rigged model. */
export const draft: MonsterDraft = {
  home: "deep-forest",
  life: "倒木の根元の穴に糸で袋を張って昼を過ごし、夜に枝から落ちてくる虫を待って食べる。人が近づくと脚をたたんで穴へ下がる。",
  origin: "大戦で木や壁を登って見張りをした大きな蜘蛛の子孫。糸を出す腺だけが今も体に比べて大きい。",
  kind: {
    name: "樹海ぐも",
    hp: 230,
    def: 8,
    flee: 26,
    atk: 20,
    hit: 36,
    exp: 120,
    respawn: 160,
    look: "model",
    model: { id: "spider", length: 1.1, axis: "x", tint: 0x5a4a3c, mute: 0.85, reach: 0.62 },
    drops: [
      { item: "sticky-thread", chance: 0.7 },
      { item: "hard-shell", chance: 0.3 },
    ],
  },
}
