import { describe, expect, it } from "vitest"
import { RECIPES } from "#/world/core/recipes/catalog"
import { STATION_RULES } from "#/world/core/crafting-rules"
import { ITEMS } from "#/world/core/items/catalog"
import { SHOPS } from "#/world/core/shops"
import { COMMISSIONS } from "#/world/core/commissions"
import { cheapestShopPrice } from "#/world/core/cheapest-shop-price"
import { shopTakes } from "#/world/core/shop-takes"
import { shopRate } from "#/world/core/shop-rate"
import { unitBuyingPrice } from "#/world/core/unit-buying-price"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopId } from "#/world/core/shop-types"
import type { StationKind } from "#/world/core/recipes/definition"

const fee = (kind: StationKind) => STATION_RULES.find((station) => station.kind === kind)!.fee

/** The least it takes to have one from the shops: bought outright, or made from what the shops sell (fees included). */
function shopCost(item: ItemId, seen: readonly ItemId[] = []): number {
  const bought = cheapestShopPrice(item) ?? Infinity
  if (seen.includes(item)) return bought
  const made = RECIPES.filter((recipe) => recipe.output.item === item && recipe.min <= 8).map(
    (recipe) => (fee(recipe.station) + recipe.inputs.reduce((sum, input) => sum + shopCost(input.item, [...seen, item]) * input.count, 0)) / recipe.output.count,
  )
  return Math.min(bought, ...made)
}

/** The most any shop pays for one: an empty shelf, the counter with the highest preference for its kind. */
function bestBuyback(item: ItemId): number {
  const shops = (Object.keys(SHOPS) as ShopId[]).filter((shop) => shopTakes(shop, item))
  return Math.max(0, ...shops.map((shop) => unitBuyingPrice({ item, stock: 0, rate: shopRate(shop, item) })))
}

describe("what things are worth against what they are made of", () => {
  it("no made thing is priced under the list price of its materials", () => {
    for (const recipe of RECIPES) {
      const materials = recipe.inputs.reduce((sum, input) => sum + ITEMS[input.item].price * input.count, 0)
      expect(ITEMS[recipe.output.item].price * recipe.output.count, recipe.id).toBeGreaterThanOrEqual(materials)
    }
  })

  it("making things from shop materials and selling them back to the shops never pays", () => {
    const checked = RECIPES.filter((recipe) => recipe.inputs.every((input) => Number.isFinite(shopCost(input.item))))
    expect(checked.length).toBeGreaterThan(10)
    for (const recipe of checked) {
      const cost = fee(recipe.station) + recipe.inputs.reduce((sum, input) => sum + shopCost(input.item) * input.count, 0)
      expect(bestBuyback(recipe.output.item) * recipe.output.count, recipe.id).toBeLessThanOrEqual(cost)
    }
  })

  it("a stronger potion heals more than the weaker ones it is brewed from", () => {
    const heal = (item: ItemId) => ITEMS[item].use?.hp ?? 0
    expect(heal("orange-potion")).toBeGreaterThan(heal("potion") * 2)
    expect(heal("white-potion")).toBeGreaterThan(heal("orange-potion"))
    expect(heal("potion")).toBeGreaterThan(heal("red-potion"))
    // the red potion is not a second 回復薬: it warms as well
    expect(ITEMS["red-potion"].use?.warm).toBeGreaterThan(0)
  })

  it("a commission takes at least the materials the recipe does, one for one", () => {
    for (const job of COMMISSIONS) {
      const recipe = RECIPES.find((candidate) => candidate.output.item === job.output.item && candidate.min <= 8)
      if (!recipe) continue
      for (const input of recipe.inputs) {
        const given = job.inputs.find((candidate) => candidate.item === input.item)?.count ?? 0
        expect(given / job.output.count, `${job.id} ${input.item}`).toBeGreaterThanOrEqual(input.count / recipe.output.count)
      }
    }
  })
})
