import { expect, it } from "vitest"
import { befriend } from "#/world/core/befriend"
import { friendDiscount } from "#/world/core/friend-discount"
import { friendPrice } from "#/world/core/friend-price"
import { FRIEND_MAX } from "#/world/core/friendship-rules"

it("raises only the named resident's friendship without changing the original record", () => {
  const friends = Object.freeze({ イルムガルト: 98, ゲルダ: 12 })
  expect(befriend(friends, "イルムガルト", 6)).toEqual({ イルムガルト: FRIEND_MAX, ゲルダ: 12 })
  expect(befriend(friends, "ハンス", 1)).toEqual({ ...friends, ハンス: 1 })
  expect(friends).toEqual({ イルムガルト: 98, ゲルダ: 12 })
})

it.each([
  [0, 0, 101],
  [9, 0, 101],
  [10, 0.01, 100],
  [99, 0.09, 92],
  [100, 0.1, 91],
  [150, 0.1, 91],
])("keeps discount steps and rounding at friendship %s", (friend, discount, price) => {
  expect(friendDiscount(friend)).toBe(discount)
  expect(friendPrice(101, friend)).toBe(price)
  expect(friendPrice(1, friend)).toBe(1)
})
