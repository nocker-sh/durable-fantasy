import { expect, it, vi } from "vitest"
import { Market } from "#/durable-objects/market"
import { Nature } from "#/durable-objects/nature"
import { durableStorage } from "#/world/test/durable-storage"
import { currentMarket } from "#/world/server/current-market"
import { restoreMarket } from "#/world/server/restore-market"
import { restoreNature } from "#/world/server/restore-nature"
vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))

it.each([
  null,
  {},
  { market: null },
  { market: { at: 1000, shelf: [] } },
  { market: { at: NaN, shelf: {} } },
  { market: { at: 1000, shelf: { bakery: { bread: [0, -1, 0, 0] } } } },
  { market: { at: 1000, shelf: {}, stock: { fruit: { apple: Infinity } } } },
])("does not migrate or overwrite unreadable market data %j", async (value) => {
  const store = durableStorage(value as object, 0)
  const before = structuredClone(store.saved.get("__void_durable_state"))
  await expect(new Market.class(store.state, {}).look("fruit", null)).rejects.toThrow(/Saved market/)
  expect(store.saved.get("__void_durable_state")).toEqual(before)
})
it.each([
  null,
  {},
  { nature: null },
  { nature: { nodes: [] } },
  { nature: { nodes: { spot: { left: -1, at: 1000 } } } },
  { nature: { nodes: { spot: { left: 0.5, at: 1000 } } } },
  { nature: { nodes: { spot: { left: 1, at: NaN } } } },
])("does not migrate or overwrite unreadable gathering data %j", async (value) => {
  const store = durableStorage(value as object, 0)
  const before = structuredClone(store.saved.get("__void_durable_state"))
  await expect(new Nature.class(store.state, {}).left("south-meadow")).rejects.toThrow(/Saved gathering/)
  expect(store.saved.get("__void_durable_state")).toEqual(before)
})
it("validates without stripping retired IDs, unknown metadata or fractional market stock", () => {
  const market = { at: 1000, since: 0, shelf: { retired: { old: [0, 1, 2, 3] } }, stock: { retired: { old: 0.25 } }, metadata: { preserved: true } }
  const nature = { nodes: { retired: { left: 3, at: 1000, metadata: true } }, metadata: true }
  expect(restoreMarket(market)).toBe(market)
  expect(restoreNature(nature)).toBe(nature)
})
it("preserves a valid zero opening timestamp instead of replacing the market with a fresh shelf", () => {
  const state = { market: { at: Date.now(), since: 0, shelf: {}, stock: { fruit: { apple: 0.25 } } } }
  const market = currentMarket(state)
  expect(market.since).toBe(0)
  expect(market.stock?.fruit.apple).toBe(0.25)
})
it("rejects a corrupt current market before initialization can replace its shelf", () => {
  const state = { market: { at: 1000, shelf: null } }
  const before = structuredClone(state)
  expect(() => currentMarket(state as never)).toThrow("Saved market data is unreadable")
  expect(state).toEqual(before)
})

it.each(["market", "nature"])("keeps an unreadable current %s envelope unchanged on read", async (kind) => {
  const value = kind === "market" ? { market: { shelf: null, at: 1000 }, serial: 0, jobs: {} } : { nature: { nodes: { spot: { left: -1, at: 1000 } } }, serial: 0, jobs: {} }
  const store = durableStorage(value, 1),
    before = structuredClone(store.saved.get("__void_durable_state"))
  if (kind === "market") await expect(new Market.class(store.state, {}).look("fruit", null)).rejects.toThrow("Saved market data is unreadable")
  else await expect(new Nature.class(store.state, {}).left("south-meadow")).rejects.toThrow("Saved gathering data is unreadable")
  expect(store.saved.get("__void_durable_state")).toEqual(before)
})
