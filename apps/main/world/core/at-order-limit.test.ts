import { expect, it } from "vitest"
import { atOrderLimit } from "#/world/core/at-order-limit"
import { MAX_OPEN_ORDERS } from "#/world/core/exchange-rules"

const now = 1_000_000
const orders = (count: number, expires = now + 1) => Array.from({ length: count }, () => ({ expires }))

it("is reached once a player's orders on the board fill the limit", () => {
  expect(atOrderLimit(orders(MAX_OPEN_ORDERS - 1), now)).toBe(false)
  expect(atOrderLimit(orders(MAX_OPEN_ORDERS), now)).toBe(true)
})

it("does not count orders already past their expiry", () => {
  expect(atOrderLimit([...orders(MAX_OPEN_ORDERS - 1), ...orders(5, now)], now)).toBe(false)
})
