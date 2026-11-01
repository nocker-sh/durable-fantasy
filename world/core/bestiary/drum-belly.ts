import type { MonsterDraft } from "#/world/core/monster-draft-types"

/** An upright burrow-sitter with a round, taut drum of a belly that it beats at dusk to call its colony. */
export const draft: MonsterDraft = {
  home: "red-dunes",
  life: "枯れ草の種と根を食べ、砂丘のふもとに群れで巣穴を掘って暮らす。夕方には巣穴の前で立ち上がって腹を叩き合い、人が近づくと強く一つ叩いて仲間ごと穴に隠れる。",
  origin: "行軍の拍子と合図を打った太鼓の兵器の子孫で、叩くとよく鳴る張った腹の皮が残った。",
  kind: {
    name: "太鼓ねずみ",
    hp: 42,
    def: 2,
    flee: 22,
    atk: 0,
    hit: 0,
    exp: 22,
    respawn: 110,
    look: "figure",
    size: 1,
    drops: [
      { item: "soft-fur", chance: 0.6 },
      { item: "raw-hide", chance: 0.25 },
    ],
    figure: {
      palette: { hide: 0xb0805a, belly: 0xe4d4b4, dark: 0x5a3c2c },
      parts: [
        { shape: "ball", size: [0.1, 0.14, 0.09], at: [0, 0.15, 0], paint: "hide" },
        { shape: "rod", size: [0.084, 0.018, 0.084], at: [0, 0.15, 0.069], turn: [1.571, 0, 0], paint: "dark" },
        { shape: "rod", size: [0.074, 0.02, 0.074], at: [0, 0.15, 0.08], turn: [1.571, 0, 0], paint: "belly" },
        { shape: "ball", size: [0.07, 0.065, 0.065], at: [0, 0.33, 0.01], paint: "hide", swing: "nod", pivot: [0, 0.28, 0] },
        { shape: "ball", size: [0.036, 0.03, 0.04], at: [0, 0.315, 0.075], paint: "belly", swing: "nod", pivot: [0, 0.28, 0] },
        { shape: "box", size: [0.016, 0.016, 0.016], at: [-0.045, 0.35, 0.055], paint: "eye", swing: "nod", pivot: [0, 0.28, 0] },
        { shape: "box", size: [0.016, 0.016, 0.016], at: [0.045, 0.35, 0.055], paint: "eye", swing: "nod", pivot: [0, 0.28, 0] },
        { shape: "ball", size: [0.016, 0.018, 0.01], at: [-0.06, 0.385, -0.01], paint: "hide", swing: "nod", pivot: [0, 0.28, 0] },
        { shape: "ball", size: [0.016, 0.018, 0.01], at: [0.06, 0.385, -0.01], paint: "hide", swing: "nod", pivot: [0, 0.28, 0] },
        { shape: "rod", size: [0.016, 0.102, 0.02], at: [-0.062, 0.19, 0.078], turn: [2.246, 0, -0.349], paint: "hide", swing: "stride-a", pivot: [-0.08, 0.22, 0.04] },
        { shape: "ball", size: [0.02, 0.018, 0.02], at: [-0.045, 0.158, 0.12], paint: "belly", swing: "stride-a", pivot: [-0.08, 0.22, 0.04] },
        { shape: "rod", size: [0.016, 0.102, 0.02], at: [0.063, 0.19, 0.078], turn: [2.246, 0, 0.349], paint: "hide", swing: "stride-b", pivot: [0.08, 0.22, 0.04] },
        { shape: "ball", size: [0.02, 0.018, 0.02], at: [0.045, 0.158, 0.12], paint: "belly", swing: "stride-b", pivot: [0.08, 0.22, 0.04] },
        { shape: "ball", size: [0.05, 0.045, 0.07], at: [-0.08, 0.045, 0.02], paint: "hide" },
        { shape: "ball", size: [0.05, 0.045, 0.07], at: [0.08, 0.045, 0.02], paint: "hide" },
        { shape: "box", size: [0.04, 0.016, 0.08], at: [-0.08, 0.008, 0.08], paint: "belly" },
        { shape: "box", size: [0.04, 0.016, 0.08], at: [0.08, 0.008, 0.08], paint: "belly" },
        { shape: "cone", size: [0.03, 0.141, 5], at: [0, 0.021, -0.13], turn: [-1.699, 0, 0], paint: "dark", swing: "wag", pivot: [0, 0.03, -0.06] },
      ],
    },
  },
}
