import { ITEMS } from "#/world/core/items/catalog"
import { TRADE_LOTS } from "#/world/core/trade-rules"
import type { Stack } from "#/world/core/bag-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Offer } from "#/world/core/trade-types"

/** 持ち物を予約せず、提示できる品の写しを作る。確定時は保存先で再検証する。 */
export function getTradeOfferPresentation(player: Pick<PlayerState, "bag" | "gold">, offer: Offer): { offer: Offer; shown: Stack[] } | null {
  const lots = offer.lots.slice(0, TRADE_LOTS)
  const shown: Stack[] = []
  for (const lot of lots) {
    const stack = player.bag[lot.slot]
    if (!stack || lot.count > stack.count || ITEMS[stack.item].kind === "key") return null
    shown.push({ ...stack, count: lot.count })
  }
  if (new Set(lots.map((lot) => lot.slot)).size !== lots.length || offer.gold > player.gold) return null

  return { offer: { lots, gold: offer.gold }, shown }
}
