import { expect, it } from "vitest"
import { apply } from "./apply"
import { dropsOf } from "#/world/core/drops-of"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { derive } from "#/world/core/derive"
import { countItem } from "#/world/core/count-item"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

it("turns loot from a spawned forest animal into a wearable charm", () => {
  const spawn = SPAWNS.find((s) => s.kind === "ash-hare")!
  expect(spawn.map).toBe("forest-edge")
  const kind = MONSTER_KINDS[spawn.kind]
  expect(dropsOf(kind, [0.64, 0.99])).toEqual(["sharp-fang"])
  expect(dropsOf(kind, [0.65, 0.35])).toEqual([])
  let state = player({ name: "エルナ", gold: 100, bag: bagWith(["yarn", 1]), life: { ...player().life, tailoring: lifeExpAt(4) } })
  for (let i = 0; i < 3; i++) {
    const loot = apply(state, { type: "loot", monster: spawn.id, exp: kind.exp, items: dropsOf(kind, [0, 1]) })
    if (!loot.ok) throw Error(loot.reason)
    state = loot.state
  }
  const crafted = apply(state, { type: "craft", recipe: "fang-charm", station: "workshop-loom", roll: 0.5 })
  if (!crafted.ok) throw Error(crafted.reason)
  const slot = crafted.state.bag.findIndex((s) => s?.item === "fang-charm")
  expect(crafted.state.bag[slot]).toMatchObject({ by: "エルナ", count: 1 })
  const worn = apply(crafted.state, { type: "equip", slot })
  if (!worn.ok) throw Error(worn.reason)
  expect(worn.state.equipment.accessory1).toBe("fang-charm")
})

it("uses meadow hare fur to tailor early body armour before the wool cape", () => {
  const spawn = SPAWNS.find((s) => s.map === "south-meadow" && s.kind === "hare")!
  const kind = MONSTER_KINDS[spawn.kind]
  const base = player({ name: "エルナ", gold: 100, bag: bagWith(["yarn", 4]), life: { ...player().life, tailoring: lifeExpAt(4) } })
  const loot = apply(base, { type: "loot", monster: spawn.id, exp: kind.exp, items: dropsOf(kind, [0]) })
  if (!loot.ok) throw Error(loot.reason)
  const command = { type: "craft" as const, recipe: "traveller-coat", station: "workshop-loom", roll: 0.5 }
  expect(apply({ ...loot.state, life: { ...base.life, tailoring: lifeExpAt(3) } }, command)).toEqual({ ok: false, reason: "NOT_SKILLED" })
  const crafted = apply(loot.state, command)
  if (!crafted.ok) throw Error(crafted.reason)
  expect(countItem(crafted.state.bag, "yarn")).toBe(0)
  expect(countItem(crafted.state.bag, "soft-fur")).toBe(0)
  const slot = crafted.state.bag.findIndex((s) => s?.item === "traveller-coat")
  expect(crafted.state.bag[slot]).toEqual({ item: "traveller-coat", count: 1, q: 1, by: "エルナ" })
  const worn = apply(crafted.state, { type: "equip", slot })
  if (!worn.ok) throw Error(worn.reason)
  expect(worn.state.equipment.body).toBe("traveller-coat")
  expect(derive(worn.state).def).toBe(derive({ ...worn.state, equipment: { ...worn.state.equipment, body: null } }).def + 3)
})
