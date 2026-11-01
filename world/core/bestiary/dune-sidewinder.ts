import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A snake that crosses the hot sand sideways, drawn from a rigged model. */
export const draft: MonsterDraft = {
  home: "red-dunes",
  life: "昼は岩陰の砂に浅く潜って過ごし、夕方から砂の上を横向きに這ってねずみや虫を探す。人の足音が伝わると砂へ潜る。",
  origin: "大戦で熱い砂地を越えて知らせを運んだ細長い生き物の子孫。体を浮かせて横に這う癖が残った。",
  kind: {
    name: "横這いへび",
    hp: 110,
    def: 4,
    flee: 20,
    atk: 14,
    hit: 22,
    exp: 48,
    respawn: 130,
    look: "model",
    model: { id: "snake", length: 2, axis: "z", tint: 0x9a7a4a, mute: 0.9, reach: 1.05 },
    drops: [
      { item: "raw-hide", chance: 0.4 },
      { item: "sharp-fang", chance: 0.35 },
    ],
  },
}
