import { defineCommission } from "#/world/core/define-commission"
import type { Commission } from "#/world/core/commission-types"

/** Resident work definitions; fees, materials and completion times follow economy.md section 3. */
export const COMMISSIONS: readonly Commission[] = [
  defineCommission({
    id: "benedict-charm",
    craftsman: "ベネディクト",
    output: ["charm", 1],
    inputs: [
      ["plank", 1],
      ["yarn", 1],
    ],
    fee: 40,
    minutes: 60,
  }),
  defineCommission({ id: "gunter-sword", craftsman: "ギュンター", output: ["iron-sword", 1], inputs: [["iron-ingot", 3]], fee: 120, minutes: 120 }),
  defineCommission({
    id: "gunter-axe",
    craftsman: "ギュンター",
    output: ["wood-axe", 1],
    inputs: [
      ["iron-ingot", 1],
      ["plank", 1],
    ],
    fee: 30,
    minutes: 60,
  }),
  defineCommission({
    id: "gunter-ingot",
    craftsman: "ギュンター",
    output: ["iron-ingot", 2],
    inputs: [
      ["rusty-scrap", 4],
      ["charcoal", 2],
    ],
    fee: 20,
    minutes: 30,
  }),
  defineCommission({
    id: "gottfried-bow",
    craftsman: "ゴットフリート",
    output: ["short-bow", 1],
    inputs: [
      ["plank", 3],
      ["yarn", 1],
    ],
    fee: 50,
    minutes: 120,
  }),
  defineCommission({
    id: "gottfried-rod",
    craftsman: "ゴットフリート",
    output: ["fishing-rod", 1],
    inputs: [
      ["plank", 1],
      ["yarn", 1],
    ],
    fee: 20,
    minutes: 60,
  }),
  defineCommission({ id: "gottfried-planks", craftsman: "ゴットフリート", output: ["plank", 6], inputs: [["log", 3]], fee: 10, minutes: 30 }),
  defineCommission({ id: "magdalena-cape", craftsman: "マグダレーナ", output: ["wool-cape", 1], inputs: [["yarn", 6]], fee: 80, minutes: 180 }),
  defineCommission({ id: "magdalena-muffler", craftsman: "マグダレーナ", output: ["wool-muffler", 1], inputs: [["yarn", 3]], fee: 30, minutes: 60 }),
  defineCommission({
    id: "irmgard-potions",
    craftsman: "イルムガルト",
    output: ["potion", 5],
    inputs: [
      ["herb", 10],
      ["jelly", 2],
    ],
    fee: 40,
    minutes: 60,
  }),
  defineCommission({
    id: "irmgard-blue-potions",
    craftsman: "イルムガルト",
    output: ["blue-potion", 2],
    inputs: [
      ["blue-herb", 3],
      ["blue-jelly", 1],
    ],
    fee: 30,
    minutes: 60,
  }),
  defineCommission({ id: "rudolf-leather", craftsman: "ルドルフ", output: ["tanned-leather", 2], inputs: [["raw-hide", 2]], fee: 16, minutes: 120 }),
  defineCommission({ id: "rudolf-boots", craftsman: "ルドルフ", output: ["leather-boots", 1], inputs: [["tanned-leather", 1]], fee: 12, minutes: 60 }),
  defineCommission({ id: "rudolf-armor", craftsman: "ルドルフ", output: ["leather-armor", 1], inputs: [["tanned-leather", 4]], fee: 70, minutes: 180 }),
  defineCommission({ id: "beatrix-mail", craftsman: "ベアトリクス", output: ["chain-mail", 1], inputs: [["iron-ingot", 4]], fee: 150, minutes: 180 }),
]
