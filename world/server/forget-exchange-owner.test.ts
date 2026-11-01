import { expect, it } from "vitest"
import { forgetExchangeOwner } from "#/world/server/forget-exchange-owner"
import { initialExchangeRecord } from "#/world/server/exchange-record"
import type { Order } from "#/world/core/exchange-types"

const order = (id: string, owner: string): Order => ({ id, owner, name: owner, side: "sell", symbol: "rye-bread", price: 3, left: 1, at: 0, expires: 1 })

it("forgets only the reset player's orders, inbox, claim and request", () => {
  const record = initialExchangeRecord()
  record.ex.orders = [order("1", "me"), order("2", "other")]
  record.ex.inbox = { me: { gold: 5, items: [] }, other: { gold: 7, items: [] } }
  record.delivery.claims = { me: { id: 1, inbox: { gold: 5, items: [] } } }
  record.requests.jobs = { me: { id: 1, connection: "c", seq: 1, name: "me", intent: { side: "sell", symbol: "rye-bread", price: 3, qty: 1 }, phase: "done" } }
  forgetExchangeOwner(record, "me")
  expect(record.ex.orders.map((o) => o.owner)).toEqual(["other"])
  expect(Object.keys(record.ex.inbox)).toEqual(["other"])
  expect(record.delivery.claims).toEqual({})
  expect(record.requests.jobs).toEqual({})
})
