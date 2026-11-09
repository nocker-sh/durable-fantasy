import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import type { Stack } from "#/world/core/bag-types"
import { emptyBag } from "#/world/core/empty-bag"
import { markFor } from "#/world/core/mark-for"
import { STORE_FEE } from "#/world/core/storage/rules"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// made things carry the mark a save holds them with (mark-old-goods.ts)
const stacks: Stack[] = (Object.keys(ITEMS) as ItemId[]).map((item) => ({ item, count: Math.min(3, ITEMS[item].stack), ...markFor(item) }))
stacks.push({ item: "wood-axe", count: 1, q: 1, by: "アルノルト", dur: 3 })

it.each(stacks)("$item: storage preserves goods across failed writes, restart and stale selection", async (stack) => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const base = player()
  // Goods and carrying capacity are local starting conditions, not a gathering or growth route.
  const initial = player({ gold: 20, stats: { ...base.stats, str: 40 }, bag: [stack, ...emptyBag(23)] })
  const store = durableStorage({ ...initialPlayerRecord(), player: initial }, 8)
  const actors = { current: new Player.class(store.state, {}) }
  const before = structuredClone(store.saved.get("__void_durable_state"))
  const deposit = { type: "store" as const, slot: 0, count: 1, expectedStack: structuredClone(stack) }
  if (ITEMS[stack.item].kind === "key") {
    expect(await actors.current.run(deposit)).toEqual({ ok: false, reason: "NOT_STORABLE" })
    expect(store.saved.get("__void_durable_state")).toEqual(before)
    return
  }
  store.failNextSave()
  await expect(actors.current.run(deposit)).rejects.toThrow("Storage unavailable")
  expect(store.saved.get("__void_durable_state")).toEqual(before)
  actors.current = new Player.class(store.state, {})
  const deposited = await actors.current.run(deposit)
  if (!deposited.ok) throw new Error(`${stack.item}: ${deposited.reason}`)
  expect(deposited.events).toEqual([expect.objectContaining({ type: "stored", item: stack.item, count: 1, fee: STORE_FEE })])
  expect(deposited.state.gold).toBe(initial.gold - STORE_FEE)
  expect(deposited.state.storage[0]).toEqual({ ...stack, count: 1 })
  expect(deposited.state.bag[0]).toEqual(stack.count === 1 ? null : { ...stack, count: stack.count - 1 })
  const saved = structuredClone(store.saved.get("__void_durable_state"))
  actors.current = new Player.class(store.state, {})
  expect(await actors.current.run(deposit)).toEqual({ ok: false, reason: "ITEM_CHANGED" })
  expect(store.saved.get("__void_durable_state")).toEqual(saved)
  const withdraw = { type: "retrieve" as const, index: 0, count: 1, expectedStack: { ...stack, count: 1 } }
  store.failNextSave()
  await expect(actors.current.run(withdraw)).rejects.toThrow("Storage unavailable")
  expect(store.saved.get("__void_durable_state")).toEqual(saved)
  actors.current = new Player.class(store.state, {})
  const retrieved = await actors.current.run(withdraw)
  if (!retrieved.ok) throw new Error(`${stack.item}: ${retrieved.reason}`)
  expect(retrieved.events).toEqual([expect.objectContaining({ type: "retrieved", item: stack.item, count: 1 })])
  expect(retrieved.state.bag).toEqual(initial.bag)
  expect(retrieved.state.storage).toEqual(initial.storage)
  expect(retrieved.state.gold).toBe(initial.gold - STORE_FEE)
  expect(retrieved.state.friends).toEqual(deposited.state.friends)
  expect(retrieved.state.boughtOn).toEqual(deposited.state.boughtOn)
  const completed = structuredClone(store.saved.get("__void_durable_state"))
  actors.current = new Player.class(store.state, {})
  expect(await actors.current.run(withdraw)).toEqual({ ok: false, reason: "ITEM_CHANGED" })
  expect(store.saved.get("__void_durable_state")).toEqual(completed)
})
