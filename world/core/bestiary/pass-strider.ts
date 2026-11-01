import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** A heavy two-legged beast of the pass, taller than a person, drawn from a rigged model. */
export const draft: MonsterDraft = {
  home: "mountain-pass",
  life: "峠の上の草地で木の芽を食べ、根を掘り返す大食いで、日の高いうちは岩棚で寝ている。荷車の音には慣れていて、近づきすぎなければ顔も上げない。",
  origin: "大戦で荷と兵を担いで山を越えるために作られた大きな二足の獣の子孫。重い体を支える脚と顎だけが残った。",
  kind: {
    name: "地鳴りとかげ",
    hp: 620,
    def: 16,
    flee: 10,
    atk: 40,
    hit: 58,
    exp: 320,
    respawn: 200,
    look: "model",
    model: { id: "trex", length: 1.7, axis: "y", tint: 0x6a6a4a, mute: 0.65, reach: 1.6 },
    drops: [
      { item: "raw-hide", chance: 0.8 },
      { item: "old-bone", chance: 0.5 },
      { item: "sharp-fang", chance: 0.4 },
    ],
  },
}
