import { commandSchema } from "#/world/core/commands"
import { sameShopQuote } from "#/world/core/same-shop-quote"
import { getShopQuoteResult } from "#/world/core/get-shop-quote-result"
import type { ShopQuote, ShopReceipt } from "#/world/core/shop-receipt-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"

type Props = { player: PlayerState; previous: ShopReceipt | undefined; quote: ShopQuote; now: number; reserved: boolean }

/** 既読の結果は現在の品の定義で再実行せず、拒否も保存して再試行へ返す。 */
export function receiveShop(props: Props): { result: Transition; receipt?: ShopReceipt } {
  const quote = props.quote,
    previous = props.previous
  if (!Number.isSafeInteger(quote.id) || quote.id <= 0) return { result: { ok: false, reason: "NOT_READY" } }
  if (previous && quote.id <= previous.quote.id) {
    if (quote.id !== previous.quote.id || !sameShopQuote(quote, previous.quote)) return { result: { ok: false, reason: "NOT_READY" } }
    if (!previous.outcome.ok) return { result: previous.outcome }
    return { result: { ok: true, state: props.player, events: [] } }
  }
  if (!Number.isSafeInteger(quote.unitPrice) || quote.unitPrice <= 0 || !commandSchema.safeParse(quote).success) return { result: { ok: false, reason: "NOT_READY" } }
  const result = getShopQuoteResult(props)

  return { result, receipt: { quote: structuredClone(quote), outcome: result.ok ? { ok: true } : result } }
}
