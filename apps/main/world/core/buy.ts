import { addItem } from "#/world/core/add-item"
import { getShopPurchase } from "#/world/core/get-shop-purchase"
import { carried } from "#/world/core/inventory-weight"
import { derive } from "#/world/core/derive"
import { dealtWith } from "#/world/core/commerce-friendship"
import { ITEMS } from "#/world/core/items/catalog"
import { SHOPS } from "#/world/core/shops"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"
import type { Command } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { ShopContext } from "#/world/core/shop-command-types"
type Props = Readonly<{ state: PlayerState; command: Extract<Command, { type: "buy" }>; now: number; context: ShopContext }>

/** Commit payment, goods and daily familiarity together after every stock and capacity check. */
export function buy(props: Props): Transition {
  const purchase = getShopPurchase(props)
  if ("reason" in purchase) return reject(purchase.reason)
  if (props.state.gold < purchase.cost) return reject("NO_GOLD")
  if (carried(props.state) + ITEMS[props.command.item].weight * props.command.count > derive(props.state).maxWeight) return reject("TOO_HEAVY")
  const bag = addItem({ bag: props.state.bag, item: props.command.item, count: props.command.count, mark: ITEMS[props.command.item].made ? { q: purchase.q, by: purchase.by } : undefined })
  if (!bag) return reject("BAG_FULL")
  const known = dealtWith(props.state, props.context.keepers ?? SHOPS[props.command.shop].keepers, props.now)
  return accept(
    { ...props.state, gold: props.state.gold - purchase.cost, bag, friends: known.friends, boughtOn: known.boughtOn },
    { type: "bought", item: props.command.item, count: props.command.count, cost: purchase.cost, ...(purchase.by ? { by: purchase.by } : {}) },
  )
}
