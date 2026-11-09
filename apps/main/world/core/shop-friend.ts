import { SHOPS } from "#/world/core/shops"
import type { PlayerState } from "#/world/core/player-types"
import type { ShopId } from "#/world/core/shop-types"

/** The friendliest keeper determines the counter's discount, with zero as the lower bound. */
export function shopFriend(state: Pick<PlayerState, "friends">, shop: ShopId) {
  return Math.max(0, ...SHOPS[shop].keepers.map((keeper) => state.friends[keeper] ?? 0))
}
