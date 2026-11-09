import { getInitialMapPlayers } from "#/world/server/map-room/get-initial-map-players"
import { readInitialMapResources } from "#/world/server/map-room/read-initial-map-resources"
import { presence } from "#/world/server/map-room/presence"
import type { PlayerState } from "#/world/core/player-types"
import type { Cell, MapPlayer } from "#/world/protocol"
import type { JoinRequestContext } from "#/world/server/map-room/join-request-types"

type Props = Readonly<{ room: JoinRequestContext; owner: string; data: PlayerState; player: MapPlayer; at: Cell }>

/** 本人の初期状態を先に送り、資源と生き物の後で確定済みの姿だけを周囲へ知らせる。 */
export async function sendInitialMapState(props: Props): Promise<void> {
  const players = getInitialMapPlayers(props.room, props.owner)
  const pending = readInitialMapResources(props.room)
  const connection = props.room.ctx.connection
  // the client counts waits and the time of day by this clock, not its own (game-system.md §7.5)
  await connection.send({ type: "snapshot", you: props.player.id, me: props.data, players, at: props.at, now: Date.now() })
  const resources = await pending
  if (!resources.ok) throw resources.error
  if (presence(connection).closed) return
  await connection.send({ type: "nodes", left: resources.left })
  if (resources.monsters) await connection.send({ type: "wild", ...resources.monsters })
  if (props.data.profileComplete) await props.room.ctx.room.broadcast({ type: "joined", player: props.player }, [connection.id])
}
