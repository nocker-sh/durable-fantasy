import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { COMMISSIONS } from "#/world/core/commissions"
import { ITEMS } from "#/world/core/items/catalog"
import { addItem } from "#/world/core/add-item"
import { countItem } from "#/world/core/count-item"
import { emptyBag } from "#/world/core/empty-bag"
import { FRIEND } from "#/world/core/friendship-rules"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it.each(COMMISSIONS)("$id: order and collection remain atomic through failed writes and restarts", async (job) => {
  vi.useFakeTimers()
  vi.setSystemTime(0)
  let bag = emptyBag()
  for (const input of job.inputs) {
    const next = addItem({ bag, item: input.item, count: input.count })
    if (!next) throw new Error(`Commission inputs cannot fit: ${job.id}`)
    bag = next
  }
  const base = player()
  // Materials, the exact fee and carrying strength are local initial conditions, not an earned route.
  const customer = player({ gold: job.fee, bag, stats: { ...base.stats, str: 20 } })
  const store = durableStorage({ ...initialPlayerRecord(), player: customer }, 8)
  let actor = new Player.class(store.state, {})
  const record = () => (store.saved.get("__void_durable_state") as { value: PlayerRecord }).value
  const initial = structuredClone(store.saved.get("__void_durable_state"))
  const order = { type: "order" as const, commission: job.id, roll: 0.5 }
  store.failNextSave()
  await expect(actor.run(order)).rejects.toThrow("Storage unavailable")
  expect(store.saved.get("__void_durable_state")).toEqual(initial)
  actor = new Player.class(store.state, {})
  const ordered = await actor.run(order)
  if (!ordered.ok) throw new Error(ordered.reason)
  expect(ordered.state.gold).toBe(0)
  expect(ordered.state.bag.every((slot) => slot === null)).toBe(true)
  expect(ordered.state.orders).toHaveLength(1)
  const waiting = structuredClone(record().player.orders)
  expect(waiting[0]).toMatchObject({ commission: job.id, readyAt: job.minutes * 60000 })
  const paid = structuredClone(store.saved.get("__void_durable_state"))
  actor = new Player.class(store.state, {})
  const collect = { type: "collect" as const, index: 0, expectedOrders: waiting }
  vi.setSystemTime(waiting[0].readyAt - 1)
  expect(await actor.run(collect)).toEqual({ ok: false, reason: "NOT_DONE" })
  expect(store.saved.get("__void_durable_state")).toEqual(paid)
  vi.setSystemTime(waiting[0].readyAt)
  store.failNextSave()
  await expect(actor.run(collect)).rejects.toThrow("Storage unavailable")
  expect(store.saved.get("__void_durable_state")).toEqual(paid)
  actor = new Player.class(store.state, {})
  const collected = await actor.run(collect)
  if (!collected.ok) throw new Error(collected.reason)
  expect(collected.state.gold).toBe(0)
  expect(collected.state.orders).toEqual([])
  expect(countItem(collected.state.bag, job.output.item)).toBe(job.output.count)
  expect(collected.state.bag.every((slot) => slot === null || slot.item === job.output.item)).toBe(true)
  for (const slot of collected.state.bag.filter((slot) => slot !== null)) {
    expect(slot.q).toBe(ITEMS[job.output.item].made ? waiting[0].q : undefined)
    expect(slot.by).toBe(ITEMS[job.output.item].made ? job.craftsman : undefined)
  }
  expect(collected.state.friends[job.craftsman]).toBe(FRIEND.commission)
  const delivered = structuredClone(store.saved.get("__void_durable_state"))
  actor = new Player.class(store.state, {})
  expect(await actor.run(collect)).toEqual({ ok: false, reason: "ORDER_CHANGED" })
  expect(store.saved.get("__void_durable_state")).toEqual(delivered)
})
