// Commissions (economy.md §3): hand a resident craftsman the materials and the fee, and after real
// time has passed, collect what they made — cheaper than the shop, better than you could make
// yourself, but it takes your materials and your patience. Pure: the room passes the time and the dice.
import type { ItemId, Quality } from "./items.ts"
import { MAKERS } from "./makers.ts"

export interface Commission {
  id: string
  /** the resident who takes it on; they must be at their counter to take it or hand it over */
  craftsman: string
  output: { item: ItemId; count: number }
  inputs: readonly { item: ItemId; count: number }[]
  fee: number
  /** real minutes it takes */
  minutes: number
}

const c = (id: string, craftsman: string, output: [ItemId, number], inputs: [ItemId, number][], fee: number, minutes: number): Commission => ({
  id,
  craftsman,
  output: { item: output[0], count: output[1] },
  inputs: inputs.map(([item, count]) => ({ item, count })),
  fee,
  minutes,
})

export const COMMISSIONS: readonly Commission[] = [
  c(
    "benedict-charm",
    "ベネディクト",
    ["charm", 1],
    [
      ["plank", 1],
      ["yarn", 1],
    ],
    40,
    60,
  ),
  c("gunter-sword", "ギュンター", ["iron-sword", 1], [["iron-ingot", 3]], 120, 120),
  c(
    "gunter-axe",
    "ギュンター",
    ["wood-axe", 1],
    [
      ["iron-ingot", 1],
      ["plank", 1],
    ],
    30,
    60,
  ),
  c(
    "gunter-ingot",
    "ギュンター",
    ["iron-ingot", 2],
    [
      ["rusty-scrap", 4],
      ["charcoal", 2],
    ],
    20,
    30,
  ),
  c(
    "gottfried-bow",
    "ゴットフリート",
    ["short-bow", 1],
    [
      ["plank", 3],
      ["yarn", 1],
    ],
    50,
    120,
  ),
  c(
    "gottfried-rod",
    "ゴットフリート",
    ["fishing-rod", 1],
    [
      ["plank", 1],
      ["yarn", 1],
    ],
    20,
    60,
  ),
  c("gottfried-planks", "ゴットフリート", ["plank", 6], [["log", 3]], 10, 30),
  c("magdalena-cape", "マグダレーナ", ["wool-cape", 1], [["yarn", 6]], 80, 180),
  c("magdalena-muffler", "マグダレーナ", ["wool-muffler", 1], [["yarn", 3]], 30, 60),
  c(
    "irmgard-potions",
    "イルムガルト",
    ["potion", 5],
    [
      ["herb", 10],
      ["jelly", 2],
    ],
    40,
    60,
  ),
  c("rudolf-leather", "ルドルフ", ["tanned-leather", 2], [["raw-hide", 2]], 16, 120),
  c("rudolf-boots", "ルドルフ", ["leather-boots", 1], [["tanned-leather", 1]], 12, 60),
  c("rudolf-armor", "ルドルフ", ["leather-armor", 1], [["tanned-leather", 4]], 70, 180),
  c("beatrix-mail", "ベアトリクス", ["chain-mail", 1], [["iron-ingot", 4]], 150, 180),
]

export const commissionOf = (id: string) => COMMISSIONS.find((x) => x.id === id)
export const MAX_ORDERS = 3

/** An order the player has placed. */
export interface Order {
  commission: string
  readyAt: number
  q: Quality
}

/** The quality a craftsman's work comes out at: by their hand (makers.ts), or steady when unknown. */
export function commissionQuality(craftsman: string, item: ItemId, roll: number): Quality {
  const w = MAKERS[craftsman]?.[item]?.tiers ?? [0.05, 0.55, 0.35, 0.05]
  const total = w.reduce((a, b) => a + b, 0)
  let r = roll * total
  for (let q = 0; q < 4; q++) {
    if (r < w[q]) return q as Quality
    r -= w[q]
  }
  return 1
}
