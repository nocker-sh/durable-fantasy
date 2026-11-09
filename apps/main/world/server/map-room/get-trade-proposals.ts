import type { TradeProposal, TradeRecord } from "#/world/core/trade-transaction-types"
import type { TradeSide } from "#/world/server/map-room/presence"

type Props = Readonly<{ id: string; mine: TradeSide; other: TradeSide; recordA: TradeRecord | null; recordB: TradeRecord | null }>

/** 双方が確認した品列を交換先へ渡し、各保存先の版だけを個別に進める。 */
export function getTradeProposals(props: Props): { local: TradeProposal; remote: TradeProposal } {
  return {
    local: { id: props.id, revision: (props.recordA?.proposal.revision ?? 0) + 1, offer: props.mine.offer, outgoing: props.mine.shown, incoming: props.other.shown, gold: props.other.offer.gold },
    remote: { id: props.id, revision: (props.recordB?.proposal.revision ?? 0) + 1, offer: props.other.offer, outgoing: props.other.shown, incoming: props.mine.shown, gold: props.mine.offer.gold },
  }
}
