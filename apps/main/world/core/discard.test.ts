import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

it("throws away part or all of a slot", () => {
  const state = player({ bag: bagWith(["log", 5]) })
  const some = apply(state, { type: "discard", slot: 0, count: 2, expectedStack: state.bag[0] ?? undefined })
  expect(some.ok && some.state.bag[0]).toEqual({ item: "log", count: 3 })
  const all = apply(state, { type: "discard", slot: 0, count: 5 })
  expect(all.ok && all.state.bag[0]).toBeNull()
  expect(apply(state, { type: "discard", slot: 0, count: 6 })).toEqual({ ok: false, reason: "NOT_ENOUGH" })
  expect(apply(state, { type: "discard", slot: 1, count: 1 })).toEqual({ ok: false, reason: "EMPTY_SLOT" })
})

it("does not throw away a key item or goods that changed since they were picked", () => {
  const key = (Object.keys(ITEMS) as ItemId[]).find((id) => ITEMS[id].kind === "key")
  if (key) expect(apply(player({ bag: bagWith([key, 1]) }), { type: "discard", slot: 0, count: 1 })).toEqual({ ok: false, reason: "NOT_DISCARDABLE" })
  const state = player({ bag: bagWith(["log", 5]) })
  expect(apply(state, { type: "discard", slot: 0, count: 1, expectedStack: { item: "log", count: 4 } })).toEqual({ ok: false, reason: "ITEM_CHANGED" })
})
