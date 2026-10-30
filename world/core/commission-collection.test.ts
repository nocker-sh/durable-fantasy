import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import type { Order } from "#/world/core/commission-types"
import { player } from "#/world/test/player"
const orders: Order[] = [
  { commission: "gunter-sword", readyAt: 1000, q: 1 },
  { commission: "irmgard-potions", readyAt: 2000, q: 2 },
]
it("rejects a stale index after an earlier collection shifts the queue", () => {
  const initial = player({ orders })
  const first = apply(initial, { type: "collect", index: 0, expectedOrders: orders }, { now: 3000 })
  if (!first.ok) throw Error(first.reason)
  const before = structuredClone(first.state)
  expect(apply(first.state, { type: "collect", index: 0, expectedOrders: orders }, { now: 3000 })).toEqual({ ok: false, reason: "ORDER_CHANGED" })
  expect(first.state).toEqual(before)
  expect(apply(first.state, { type: "collect", index: 0, expectedOrders: first.state.orders }, { now: 3000 }).ok).toBe(true)
})
it("does not collect a second identical order on a duplicate request", () => {
  const queue = [orders[0], { ...orders[0] }]
  const result = apply(player({ orders: queue }), { type: "collect", index: 0, expectedOrders: queue }, { now: 3000 })
  if (!result.ok) throw Error(result.reason)
  expect(apply(result.state, { type: "collect", index: 0, expectedOrders: queue }, { now: 3000 })).toEqual({ ok: false, reason: "ORDER_CHANGED" })
  expect(result.state.orders).toHaveLength(1)
})
it.each(["commission", "readyAt", "q"] as const)("checks changed order %s even if the queue length stays equal", (field) => {
  const queue = structuredClone(orders)
  if (field === "commission") queue[0].commission = "rudolf-boots"
  if (field === "readyAt") queue[0].readyAt++
  if (field === "q") queue[0].q = 3
  expect(apply(player({ orders: queue }), { type: "collect", index: 0, expectedOrders: orders }, { now: 3000 })).toEqual({ ok: false, reason: "ORDER_CHANGED" })
})
it("allows recovery and unrelated player changes without invalidating the queue", () => {
  const state = player({ orders, gold: 999, revision: 12 })
  expect(apply(state, { type: "collect", index: 1, expectedOrders: structuredClone(orders) }, { now: 3000 }).ok).toBe(true)
})
