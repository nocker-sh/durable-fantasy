import type { Offer } from "#/world/core/trade-types"

/** 提示する品と所持金を持たない初期状態を返す。 */
export function emptyOffer(): Offer {
  return { lots: [], gold: 0 }
}
