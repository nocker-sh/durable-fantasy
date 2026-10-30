import { apply } from "#/world/core/apply"
import type { ShopQuote } from "#/world/core/shop-receipt-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"

type Props = { player: PlayerState; quote: ShopQuote; now: number; reserved: boolean }

/** 予約と売る品を確認し、市場で確定した単価と店番で売買を適用する。 */
export function getShopQuoteResult(props: Props): Transition {
  if (props.reserved) return { ok: false, reason: "NOT_READY" }
  const quote = props.quote
  const slot = quote.type === "sell" ? props.player.bag[quote.slot] : null
  if (quote.type === "sell" && (!slot || slot.item !== quote.stack.item || slot.q !== quote.stack.q || slot.by !== quote.stack.by)) return { ok: false, reason: "EMPTY_SLOT" }

  return apply(props.player, quote, { now: props.now, price: quote.unitPrice, keepers: quote.keepers })
}
