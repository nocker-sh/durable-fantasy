import { expect, it } from "vitest"
import { equipmentDefense, derive } from "./stats"
import { ITEMS } from "./items"
import { apply } from "./apply"
import { player } from "../test/helpers"

it.each([
  [0, 5],
  [1, 6],
  [2, 7],
  [3, 9],
] as const)("applies armor quality %s with integer rounding", (quality, defense) => {
  expect(equipmentDefense("leather-armor", quality)).toBe(defense)
})

it("preserves unmarked and non-crafted armor defense", () => {
  expect(equipmentDefense("leather-armor")).toBe(6)
  expect(equipmentDefense("traveller-coat", 3)).toBe(3)
  const p = player()
  const armor = { ...p, equipment: { ...p.equipment, body: "leather-armor" as const } }
  expect(derive(armor).def - derive(p).def).toBe(6)
})

it.each([
  ["leather", "leather-boots", "ルドルフ"],
  ["leather", "leather-armor", "ルドルフ"],
  ["armorer", "chain-mail", "ベアトリクス"],
  ["armorer", "iron-helm", "ベアトリクス"],
  ["tailor", "cloth-hat", "マグダレーナ"],
] as const)("keeps the regular shop price and records the maker: %s", (shop, item, maker) => {
  const result = apply(player({ gold: 1000 }), { type: "buy", shop, item, count: 1 })
  if (!result.ok) throw Error(result.reason)
  expect(result.state.gold).toBe(1000 - ITEMS[item].price)
  expect(result.state.bag).toContainEqual({ item, count: 1, q: 1, by: maker })
})
