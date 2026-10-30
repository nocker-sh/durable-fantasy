import { SHOPS } from "#/world/core/shops"
import { keeperPresent } from "#/world/maps/keeper-present"

/** Is the shop minded at `min`: is one of its keepers at their spot? */
export function shopOpen(shopId: keyof typeof SHOPS, minute: number): boolean {
  return SHOPS[shopId].keepers.some((name) => keeperPresent(shopId, name, minute))
}
