import { SHOPS } from "#/world/core/shops"
import { ITEMS } from "#/world/core/items/catalog"
import { makerAt } from "#/world/core/maker-at"
import { qualitiesOf } from "#/world/core/qualities-of"
import { friendPrice } from "#/world/core/friend-price"
import { priceOf } from "#/world/core/price-of"
import { shopFriend } from "#/world/core/shop-friend"
import type { Command, Reason } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { ShopContext, ShopPurchase } from "#/world/core/shop-command-types"
import type { ShopDefinition } from "#/world/core/shop-types"
type Props = Readonly<{ state: PlayerState; command: Extract<Command, { type: "buy" }>; context: ShopContext }>

/** Resolve the authored stock and available quality before checking payment or carrying capacity. */
export function getShopPurchase(props: Props): ShopPurchase | { reason: Reason } {
  const shop: ShopDefinition = SHOPS[props.command.shop]
  if (!shop.stock.includes(props.command.item)) return { reason: "NOT_SOLD_HERE" }
  const made = ITEMS[props.command.item].made
  const by = made ? makerAt(props.command.shop, props.command.item) : undefined
  const q = props.command.q ?? 1
  if (made && !qualitiesOf(props.command.item, by).includes(q)) return { reason: "NOT_SOLD_HERE" }
  const cost = friendPrice(props.context.price ?? priceOf(props.command.item, q, by), shopFriend(props.state, props.command.shop)) * props.command.count
  return { q, by, cost }
}
