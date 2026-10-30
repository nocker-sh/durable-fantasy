import { takeFromSlot } from "#/world/core/take-from-slot"
import { sellable } from "#/world/core/items/sellable"
import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_PRICE } from "#/world/core/items/kinds"
import { SHOPS } from "#/world/core/shops"
import { sellsFor } from "#/world/core/sells-for"
import { dealtWith } from "#/world/core/commerce-friendship"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"
import type { Command } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { ShopContext } from "#/world/core/shop-command-types"
type Props = Readonly<{ state: PlayerState; command: Extract<Command, { type: "sell" }>; now: number; context: ShopContext }>

/** Keep goods and familiarity unchanged if quantity or the complete payment cannot be committed. */
export function sell(props: Props): Transition {
  const state = props.state,
    command = props.command,
    context = props.context
  const slot = state.bag[command.slot]
  if (!slot) return reject("EMPTY_SLOT")
  if (!sellable(slot.item)) return reject("NOT_SELLABLE")
  const bag = takeFromSlot(state.bag, command.slot, command.count)
  if (!bag) return reject("NOT_ENOUGH")
  const each = context.price !== undefined ? (ITEMS[slot.item].made ? Math.max(1, Math.floor(context.price * QUALITY_PRICE[slot.q ?? 1])) : context.price) : sellsFor(command.shop, slot)
  const gain = each * command.count
  if (!Number.isSafeInteger(gain) || !Number.isSafeInteger(state.gold + gain)) return reject("NOT_READY")
  const known = SHOPS[command.shop].kind === "buyer" ? dealtWith(state, context.keepers ?? SHOPS[command.shop].keepers, props.now) : state
  return accept({ ...state, gold: state.gold + gain, bag, friends: known.friends, boughtOn: known.boughtOn }, { type: "sold", item: slot.item, count: command.count, gain })
}
