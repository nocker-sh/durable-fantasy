import { expect, it } from "vitest"
import { equipmentDefense } from "#/world/core/equipment-defense"
import { derive } from "#/world/core/derive"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { apply } from "#/world/core/apply"
import { player } from "#/world/test/player"

it.each([
  [0, 5],
  [1, 6],
  [2, 7],
  [3, 9],
] as const)("applies armor quality %s with integer rounding", (quality, defense) => {
  expect(equipmentDefense("leather-armor", quality)).toBe(defense)
})

it("preserves unmarked and non-crafted armor defense", () => {
  for (const id of ITEM_IDS) {
    expect(equipmentDefense(id)).toBe(ITEMS[id].equip?.def ?? 0)
    if (!ITEMS[id].made) expect(equipmentDefense(id, 3)).toBe(ITEMS[id].equip?.def ?? 0)
  }
  const p = player()
  const armor = { ...p, equipment: { ...p.equipment, body: "leather-armor" as const } }
  expect(derive(armor).def - derive(p).def).toBe(6)
})

it("applies crafted clothing quality while preserving unmarked clothing", () => {
  expect(ITEMS["traveller-coat"].made).toBe(true)
  expect(equipmentDefense("traveller-coat")).toBe(3)
  expect(equipmentDefense("traveller-coat", 3)).toBe(4)
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
