import { expect, it } from "vitest"
import type { Order } from "#/world/core/exchange-types"
import { initialExchangeRecord } from "#/world/server/exchange-record"
import { viewExchange } from "#/world/server/view-exchange"

const later = Date.now() + 86_400_000
const order = (props: Pick<Order, "id" | "owner" | "name" | "price"> & Partial<Order>): Order => ({ side: "sell", symbol: "potion@1", left: 3, at: 1, expires: later, ...props })

it("shows other sellers without their player ids, and the viewer's own orders in full", () => {
  const state = initialExchangeRecord()
  state.ex.orders = [
    order({ id: "a", owner: "p-anna", name: "アンナ", price: 12, by: "アンナ", sold: 24 }),
    order({ id: "b", owner: "p-bruno", name: "ブルーノ", price: 9 }),
    order({ id: "c", owner: "p-anna", name: "アンナ", price: 5, side: "buy" }),
  ]
  const view = viewExchange({ state }, "potion@1", "p-bruno")
  expect(view.last.map((o) => o.id)).toEqual(["b", "a"])
  for (const seller of view.last) {
    expect(seller).not.toHaveProperty("owner")
    expect(seller).not.toHaveProperty("sold")
  }
  expect(view.last[1]).toMatchObject({ name: "アンナ", by: "アンナ", price: 12, left: 3 })
  expect(JSON.stringify(view.last)).not.toContain("p-anna")
  expect(view.mine).toEqual([state.ex.orders[1]])
})
