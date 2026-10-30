import type { WebSocketConnection } from "void/ws"
import type { ServerMessage } from "#/world/protocol"
import type { TradeSide } from "#/world/server/map-room/presence"
import { presence } from "#/world/server/map-room/presence"

/** Show both sides of a trade what is on the table. */
export async function showTrade(a: WebSocketConnection<ServerMessage>, b: WebSocketConnection<ServerMessage>) {
  const pa = presence(a),
    pb = presence(b)
  if (!pa.trade || !pb.trade || !pa.player || !pb.player) return
  const side = (t: TradeSide) => ({ stacks: t.shown, gold: t.offer.gold, locked: t.locked, done: t.done })
  await a.send({ type: "trade-view", with: b.id, name: pb.player.name, mine: side(pa.trade), lots: [...pa.trade.offer.lots], theirs: side(pb.trade) })
  await b.send({ type: "trade-view", with: a.id, name: pa.player.name, mine: side(pb.trade), lots: [...pb.trade.offer.lots], theirs: side(pa.trade) })
}
