import type { Shape } from "#/world/core/items/weapon-types"

export const REMADE_WEAPONS = {
  dagger: { name: "ダガー", base: { icon: "dagger", atk: 9, delay: 1200, needs: { dex: 7 }, scale: { dex: "C", str: "E" }, weight: 40, price: 40 }, text: "刃渡りの短い小刀。" },
  "hand-axe": { name: "手斧", base: { icon: "axe", atk: 20, delay: 1700, needs: { str: 9 }, scale: { str: "C" }, weight: 70, price: 90 }, text: "薪割りにも戦いにも使える。" },
  "battle-axe": {
    name: "戦斧",
    base: { icon: "axe", atk: 48, delay: 2300, needs: { str: 16 }, scale: { str: "B" }, twoHanded: true, weight: 150, price: 380 },
    text: "両手で振るう大きな斧。",
  },
  spear: {
    name: "槍",
    base: { icon: "spear", atk: 28, delay: 1900, needs: { str: 9, dex: 9 }, scale: { dex: "C", str: "D" }, twoHanded: true, weight: 100, price: 150 },
    text: "間合いの長い槍。両手で持つ。",
  },
  mace: { name: "メイス", base: { icon: "mace", atk: 26, delay: 1800, needs: { str: 12 }, scale: { str: "C" }, weight: 90, price: 180 }, text: "鉄の頭をもつ打撃武器。" },
} satisfies Record<string, { name: string; base: Omit<Shape, "name" | "forge" | "text">; text: string }>
