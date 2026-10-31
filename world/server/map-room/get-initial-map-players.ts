import { presence } from "#/world/server/map-room/presence"
import type { MapPlayer } from "#/world/protocol"
import type { JoinRequestContext } from "#/world/server/map-room/join-request-types"

/** 同じ本人の古い接続を閉じ、本人と未確定の姿を初期状態へ含めない。 */
export function getInitialMapPlayers(room: JoinRequestContext, owner: string): MapPlayer[] {
  const players: MapPlayer[] = []
  for (const connection of room.ctx.room.getConnections()) {
    const current = presence(connection)
    if (connection.id !== room.ctx.connection.id && current.owner === owner && current.player) {
      connection.close(4001, "Character opened elsewhere")
      continue
    }
    const player = current.ready === false ? null : current.player
    if (player && connection.id !== room.ctx.connection.id) players.push(player)
  }
  return players
}
