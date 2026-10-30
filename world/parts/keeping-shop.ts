import { shopOfKeeper } from "#/world/core/shop-of-keeper"
import { keeperPresent } from "#/world/maps/keeper-present"

/** Is the resident minding their shop now (a seller off duty just talks). */
export function keepingShop(name: string, min: number): boolean {
  const shop = shopOfKeeper(name, (id) => keeperPresent(id, name, min))
  return shop !== null && keeperPresent(shop, name, min)
}
