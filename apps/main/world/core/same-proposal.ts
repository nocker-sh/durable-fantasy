import { sameStacks } from "#/world/core/same-stacks"
import type { TradeProposal } from "#/world/core/trade-transaction-types"

/** 同じ取引と版へ異なる内容の再送を受け入れない。 */
export function sameProposal(a: TradeProposal, b: TradeProposal): boolean {
  return (
    a.id === b.id &&
    a.revision === b.revision &&
    a.gold === b.gold &&
    a.offer.gold === b.offer.gold &&
    a.offer.lots.length === b.offer.lots.length &&
    a.offer.lots.every((lot, i) => lot.slot === b.offer.lots[i].slot && lot.count === b.offer.lots[i].count) &&
    sameStacks(a.outgoing, b.outgoing) &&
    sameStacks(a.incoming, b.incoming)
  )
}
