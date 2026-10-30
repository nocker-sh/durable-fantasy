import { expect, it, vi } from "vitest"
import { Exchange } from "../../durable-objects/exchange"
import { emptyExchange } from "#/world/core/empty-exchange"
import { place } from "#/world/core/place"
import { emptyClaims } from "#/world/core/empty-claims"
import type { ExchangeClaims } from "#/world/core/exchange-claim-types"
import { emptyRequests } from "#/world/core/empty-requests"
import type { OrderRequests } from "#/world/core/exchange-order-types"
import { durableStorage } from "../test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))

it.each([0, 1, 2])("preserves orders, proceeds and existing recovery records through exchange version %s", async (version) => {
  const ex = place(emptyExchange(), { owner: "seller", name: "売り手", side: "sell", symbol: "potion@1", price: 10, qty: 3, by: "イルムガルト" }, Date.now()).state
  ex.inbox.owner = { gold: 7, items: [{ item: "herb", count: 2 }] }
  ex.fees = 3
  ex.history["potion@1"] = [{ day: "2026-10-21", open: 9, high: 11, low: 8, close: 10, volume: 4 }]
  const delivery: ExchangeClaims = version >= 1 ? { claimSerial: 7, claims: { owner: { id: 7, inbox: { gold: 2, items: [{ item: "log", count: 1 }] } } } } : emptyClaims()
  const requests: OrderRequests =
    version >= 2
      ? { serial: 8, jobs: { owner: { id: 8, connection: "connection", seq: 4, name: "買い手", intent: { side: "buy", symbol: "log", price: 10, qty: 1 }, phase: "pending" } } }
      : emptyRequests()
  const value = { ex, ...(version >= 1 ? { delivery } : {}), ...(version >= 2 ? { requests } : {}) }
  const f = durableStorage(value, version)
  const actor = new Exchange.class(f.state, {})
  expect(await actor.look("potion@1", "seller")).toMatchObject({ book: { asks: [{ price: 10, qty: 3 }] }, mine: ex.orders, history: ex.history["potion@1"] })
  expect(f.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 2, value: { ex, delivery, requests } })
})
