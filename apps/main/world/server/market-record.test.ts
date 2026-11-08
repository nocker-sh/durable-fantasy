import { expect, it, vi } from "vitest"
import { Market } from "#/durable-objects/market"
import { emptyMarket } from "#/world/core/empty-market"
import { durableStorage } from "#/world/test/durable-storage"
import type { MarketRecord } from "#/world/server/market-record-types"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
it.each([0, 1])("preserves all stock and existing reservations through market envelope %s", async (version) => {
  const market = { ...emptyMarket(1000), since: 900, shelf: { bakery: { "rye-bread": [1, 2, 3, 4] as [number, number, number, number] } }, stock: { fruit: { apple: 3.25 } } }
  const command = { type: "buy" as const, shop: "fruit" as const, item: "apple" as const, count: 2 }
  const jobs: MarketRecord["jobs"] = version
    ? { owner: { id: 4, connection: "connection", seq: 3, command, quote: { ...command, id: 4, unitPrice: 5, keepers: ["オットー"] }, at: 1000, phase: "pending" } }
    : {}
  const value = version ? { market, serial: 4, jobs } : { market }
  const f = durableStorage(value, version)
  const actor = new Market.class(f.state, {})
  expect(await actor.beginTrade({ owner: "", connection: "", seq: 0, command: command, keepers: [], toClose: null })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(f.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 1, value: { market, serial: version ? 4 : 0, jobs } })
})
