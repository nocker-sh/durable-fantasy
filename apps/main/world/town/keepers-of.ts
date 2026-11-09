import { SHOPS } from "#/world/core/shops"
import { isShopId } from "#/world/core/is-shop-id"
import { HOUSEHOLDS } from "#/world/town/houses"
import type { Interior } from "#/world/town/interiors"
import { OUT_FRONT } from "#/world/town/interiors"

/** Who works behind the counter: the shop's keepers, or the household of a public building (the warehouse). */
export function keepersOf(it: Interior): readonly string[] {
  if (it.house.shop) return (isShopId(it.house.shop) ? SHOPS[it.house.shop].keepers : []).filter((keeper) => !Object.values(OUT_FRONT).includes(keeper))
  return HOUSEHOLDS.find((h) => h.id === it.house.household)?.members ?? []
}
