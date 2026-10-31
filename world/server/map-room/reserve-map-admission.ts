import { Player } from "#/durable-objects/player"
import { Directory } from "#/durable-objects/directory"
import { mayVisit } from "#/world/core/may-visit"
import type { PlayerState } from "#/world/core/player-types"
import type { Message } from "#/world/server/map-room/context"
import type { JoinRequestContext, MapAdmissionProgress } from "#/world/server/map-room/join-request-types"

type Props = Readonly<{ room: JoinRequestContext; owner: string; message: Message<"join">; progress: MapAdmissionProgress }>

/** 本人の保存状態を読んでから定員を予約し、入場しない場合も予約の有無を後始末へ残す。 */
export async function reserveMapAdmission(props: Props): Promise<PlayerState | null> {
  const player = await Player.get(props.owner).read()
  const key = props.room.key
  const channel = await Directory.get(`town-${key.world}`).arrive({ map: key.map, channel: key.channel, following: !!props.message.following })
  props.progress.counted = !!channel
  if (!channel) {
    await props.room.ctx.connection.send({ type: "refused", what: "join", reason: "FULL" })
    return null
  }
  if (!import.meta.env.DEV && !mayVisit(props.message.player, player.threads, key.world)) {
    await props.room.ctx.connection.send({ type: "refused", what: "join", reason: "NOT_YOUR_TOWN" })
    return null
  }
  return player
}
