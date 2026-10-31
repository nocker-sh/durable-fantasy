import { reserveMapAdmission } from "#/world/server/map-room/reserve-map-admission"
import { arriveMapPlayer } from "#/world/server/map-room/arrive-map-player"
import { sendInitialMapState } from "#/world/server/map-room/send-initial-map-state"
import { Player } from "#/durable-objects/player"
import { presence } from "#/world/server/map-room/presence"
import { getMapAdmissionPresence } from "#/world/server/map-room/get-map-admission-presence"
import { walkable } from "#/world/maps/walkable"
import type { Cell } from "#/world/protocol"
import type { Message } from "#/world/server/map-room/context"
import type { JoinRequestContext, MapAdmissionProgress } from "#/world/server/map-room/join-request-types"

type Props = Readonly<{ room: JoinRequestContext; owner: string; message: Message<"join">; progress: MapAdmissionProgress }>

/** 到着を保存先が認めた後にだけ部屋へ入れ、初期通知の失敗で入場済みの定員を戻さない。 */
export async function admitMapConnection(props: Props): Promise<void> {
  const data = await reserveMapAdmission(props)
  if (!data) return
  const arrival = await arriveMapPlayer(props.room, props.owner)
  if (!arrival) return
  if (presence(props.room.ctx.connection).closed) {
    await Player.get(props.owner).leave(props.room.ctx.connection.id)
    return
  }
  const spawn = props.room.map.spawn
  const at: Cell = walkable(props.room.map, arrival.at) ? arrival.at : [spawn[0], spawn[1]]
  const initial = getMapAdmissionPresence({ data, at, connectionId: props.room.ctx.connection.id, message: props.message, now: Date.now() })
  props.room.save(initial)
  props.progress.admitted = true
  await sendInitialMapState({ room: props.room, owner: props.owner, data, player: initial.player, at })
}
