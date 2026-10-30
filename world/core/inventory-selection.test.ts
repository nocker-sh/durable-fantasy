import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { emptyBag } from "#/world/core/empty-bag"
import type { Stack } from "#/world/core/bag-types"
import { commandSchema } from "#/world/core/commands"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { player } from "#/world/test/player"
const grabbed: Stack = { item: "wood-axe", count: 1, q: 2, by: "ギュンター", dur: 3 }
function state(stack: Stack = grabbed) {
  const initial = player()
  return player({ stats: { ...initial.stats, str: 40 }, life: { ...initial.life, woodcutting: lifeExpAt(4) }, bag: [stack, ...emptyBag(23)] })
}
it.each(["move", "equip"] as const)("rejects a stale dragged source during %s without moving any item", (type) => {
  const before = state({ ...grabbed, dur: 2 }),
    snapshot = structuredClone(before)
  const command = type === "move" ? { type, from: 0, to: 1, expectedStack: grabbed, expectedTarget: null } : { type, slot: 0, expectedStack: grabbed }
  expect(apply(before, command)).toEqual({ ok: false, reason: "ITEM_CHANGED" })
  expect(before).toEqual(snapshot)
})
it("does not swap with a destination that changed after the drop", () => {
  const before = state(),
    bag = [...before.bag]
  bag[1] = { item: "herb", count: 2 }
  expect(apply({ ...before, bag }, { type: "move", from: 0, to: 1, expectedStack: grabbed, expectedTarget: null })).toEqual({ ok: false, reason: "ITEM_CHANGED" })
})
it("moves and equips the unchanged tool without resetting its mark or wear", () => {
  const moved = apply(state(), commandSchema.parse({ type: "move", from: 0, to: 1, expectedStack: grabbed, expectedTarget: null }))
  if (!moved.ok) throw Error(moved.reason)
  expect(moved.state.bag[1]).toEqual(grabbed)
  const worn = apply(moved.state, commandSchema.parse({ type: "equip", slot: 1, expectedStack: grabbed }))
  if (!worn.ok) throw Error(worn.reason)
  expect(worn.state.worn.weapon).toEqual({ q: grabbed.q, by: grabbed.by, dur: grabbed.dur })
  const removed = apply(worn.state, commandSchema.parse({ type: "unequip", slot: "weapon", expectedStack: grabbed }))
  if (!removed.ok) throw Error(removed.reason)
  expect(removed.state.bag).toContainEqual(grabbed)
})
it("does not remove a different or newly worn item from a stale drag", () => {
  const before = state(),
    equipped = { ...before, equipment: { ...before.equipment, weapon: "wood-axe" as const }, worn: { ...before.worn, weapon: { q: 2 as const, by: grabbed.by, dur: 2 } } }
  expect(apply(equipped, { type: "unequip", slot: "weapon", expectedStack: grabbed })).toEqual({ ok: false, reason: "ITEM_CHANGED" })
})
it("does not consume another dose from an old slot selection", () => {
  const selected: Stack = { item: "potion", count: 3 }
  const first = apply(state(selected), { type: "use", slot: 0, expectedStack: selected })
  if (!first.ok) throw Error(first.reason)
  expect(first.state.bag[0]?.count).toBe(2)
  expect(apply(first.state, { type: "use", slot: 0, expectedStack: selected })).toEqual({ ok: false, reason: "ITEM_CHANGED" })
})
it("rejects a changed sale before changing gold or friendship", () => {
  const before = state({ item: "herb", count: 2 }),
    snapshot = structuredClone(before)
  expect(apply(before, { type: "sell", shop: "buyer", slot: 0, count: 1, expectedStack: { item: "herb", count: 3 } })).toEqual({ ok: false, reason: "ITEM_CHANGED" })
  expect(before).toEqual(snapshot)
})
