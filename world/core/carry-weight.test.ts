import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { carried } from "#/world/core/inventory-weight"
import { derive } from "#/world/core/derive"
import { emptyBag } from "#/world/core/empty-bag"
import { ITEMS } from "#/world/core/items/catalog"
import { NODES } from "#/world/core/gather"
import { player } from "#/world/test/player"

/** logs, then herbs, up to exactly `room` short of the weight limit */
const loaded = (room: number) => {
  const state = player({ bag: emptyBag() })
  const space = derive(state).maxWeight - carried(state) - room
  const logs = Math.floor(space / ITEMS.log.weight)
  const herbs = (space - logs * ITEMS.log.weight) / ITEMS.herb.weight
  const bag = emptyBag().map((_, index) => {
    const count = Math.min(99, logs - index * 99)
    if (count > 0) return { item: "log" as const, count }
    return index === Math.ceil(logs / 99) && herbs > 0 ? { item: "herb" as const, count: herbs } : null
  })
  return player({ bag })
}

it("leaves behind spoils that would be too heavy, and keeps the light ones", () => {
  const state = loaded(ITEMS["blue-jelly"].weight)
  const looted = apply(state, { type: "loot", monster: "slime", exp: 1, items: ["log", "blue-jelly"] })
  if (!looted.ok) throw Error(looted.reason)
  expect(looted.events[0]).toMatchObject({ items: ["blue-jelly"], left: ["log"] })
  expect(carried(looted.state)).toBeLessThanOrEqual(derive(looted.state).maxWeight)
})

it("does not gather past the weight that can be carried", () => {
  const herb = NODES.find((n) => n.kind === "herbs")!
  const state = loaded(0)
  expect(apply(state, { type: "gather", node: herb.id, roll: 0.1 })).toEqual({ ok: false, reason: "TOO_HEAVY" })
  expect(apply(player(), { type: "gather", node: herb.id, roll: 0.1 }).ok).toBe(true)
})
