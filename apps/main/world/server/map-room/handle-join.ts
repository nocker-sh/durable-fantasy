import { admitMapConnection } from "#/world/server/map-room/admit-map-connection"
import { finishMapAdmission } from "#/world/server/map-room/finish-map-admission"
import { presence } from "#/world/server/map-room/presence"
import type { Message } from "#/world/server/map-room/context"
import type { JoinRequestContext } from "#/world/server/map-room/join-request-types"

/** 入場中の重複要求を止め、定員の予約と入場済みの状態を分けて後始末する。 */
export async function handleJoin(room: JoinRequestContext, message: Message<"join">) {
  const me = room.me
  if (me.player || me.joining || !me.owner || message.player !== me.owner) return
  room.save({ joining: true })
  const progress = { counted: false, admitted: false }
  try {
    await admitMapConnection({ room, owner: me.owner, message, progress })
  } catch (error) {
    // 入場前の失敗には何も返していない。閉じれば、ブラウザが新しい接続で入り直す。
    if (!progress.admitted && !presence(room.ctx.connection).closed) {
      try {
        room.ctx.connection.close(1011, "Join failed")
      } catch {
        // すでに閉じかけている
      }
    }
    throw error
  } finally {
    await finishMapAdmission(room, progress)
  }
}
