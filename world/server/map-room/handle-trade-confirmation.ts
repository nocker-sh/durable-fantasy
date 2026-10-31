import { Player } from "#/durable-objects/player"
import { presence } from "#/world/server/map-room/presence"
import { setTrade } from "#/world/server/map-room/set-trade"
import { showTrade } from "#/world/server/map-room/show-trade"
import { getTradeConfirmationParticipants } from "#/world/server/map-room/get-trade-confirmation-participants"
import { settleMapTrade } from "#/world/server/map-room/settle-map-trade"
import type { Ctx, Message } from "#/world/server/map-room/context"

/** 双方の確定を通信待ちより先に予約し、重複する確定操作から二つの処理を始めない。 */
export async function handleTradeConfirmation(room: Ctx, message: Message<"trade-lock" | "trade-go">) {
  const participants = getTradeConfirmationParticipants(room)
  if (!participants) return
  if (message.type === "trade-lock") room.save({ trade: { ...participants.mine, locked: true } })
  else if (participants.mine.locked && participants.theirs.locked) room.save({ trade: { ...participants.mine, done: true } })
  const mine = presence(room.ctx.connection).trade
  if (!mine) return
  if (!(mine.done && participants.theirs.done)) return showTrade(room.ctx.connection, participants.peer)
  room.save({ trade: { ...mine, settling: true } })
  setTrade(participants.peer, { ...participants.theirs, settling: true })
  const playerA = Player.get(participants.ownerA)
  const playerB = Player.get(participants.ownerB)
  await settleMapTrade({ room, peer: participants.peer, mine, other: participants.other, ownerA: participants.ownerA, ownerB: participants.ownerB, playerA, playerB })
}
