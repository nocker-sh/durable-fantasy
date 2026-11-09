import type { WebSocketConnection } from "void/ws"
import type { ServerMessage } from "#/world/protocol"
import { presence } from "#/world/server/map-room/presence"
import { getTradeView } from "#/world/server/map-room/get-trade-view"

type Connection = Pick<WebSocketConnection<ServerMessage>, "id" | "state" | "send">

/** 接続と提示がそろっている双方へ、各自の向きで順に送る。送信失敗は呼出し元へ返す。 */
export async function showTrade(sender: Connection, recipient: Connection) {
  const mine = presence(sender)
  const other = presence(recipient)
  if (!mine.trade || !other.trade || !mine.player || !other.player) return
  await sender.send(getTradeView({ mine: mine.trade, theirs: other.trade, peerId: recipient.id, peerName: other.player.name }))
  await recipient.send(getTradeView({ mine: other.trade, theirs: mine.trade, peerId: sender.id, peerName: mine.player.name }))
}
