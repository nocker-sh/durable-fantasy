import type { ServerMessage } from "#/world/protocol"
import type { TradeSide } from "#/world/server/map-room/presence"

type Props = Readonly<{ mine: TradeSide; theirs: TradeSide; peerId: string; peerName: string }>

/** 自分の提示枠だけを操作用に渡し、相手の持ち物の枠番号は公開しない。 */
export function getTradeView(props: Props): Extract<ServerMessage, { type: "trade-view" }> {
  return {
    type: "trade-view",
    with: props.peerId,
    name: props.peerName,
    mine: { stacks: props.mine.shown, gold: props.mine.offer.gold, locked: props.mine.locked, done: props.mine.done },
    lots: [...props.mine.offer.lots],
    theirs: { stacks: props.theirs.shown, gold: props.theirs.offer.gold, locked: props.theirs.locked, done: props.theirs.done },
  }
}
