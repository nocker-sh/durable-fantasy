import { expect, it } from "vitest"
import { SHOPS } from "#/world/core/shops"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopId } from "#/world/core/shop-types"
import { shopOpen } from "#/world/maps/shop-open"

const clock = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`

/** The half hours at which no open counter sells the item. */
function unsold(item: ItemId): number[] {
  const shops = (Object.keys(SHOPS) as ShopId[]).filter((shop) => (SHOPS[shop].stock as readonly ItemId[]).includes(item))
  const missing: number[] = []
  for (let minute = 0; minute < 24 * 60; minute += 30) if (!shops.some((shop) => shopOpen(shop, minute))) missing.push(minute)
  return missing
}

it.each(["dagger", "short-sword", "oak-staff", "wood-axe", "sickle", "fishing-rod"] as const)("a first %s can be bought at any hour (economy.md「旅立ちの品」)", (item) => {
  expect(unsold(item).map(clock)).toEqual([])
})

it.each(["firewood", "charcoal"] as const)("%s is never out of reach for more than half an hour", (item) => {
  const missing = unsold(item)
  const longest = missing.reduce((run, minute, index) => (index > 0 && missing[index - 1] === minute - 30 ? { now: run.now + 30, most: Math.max(run.most, run.now + 30) } : { now: 30, most: Math.max(run.most, 30) }), { now: 0, most: 0 })
  expect(longest.most, missing.map(clock).join(" ")).toBeLessThanOrEqual(30)
})
