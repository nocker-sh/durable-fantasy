import { mapPlayer } from "#/world/server/map-room/map-player"
import type { PlayerState } from "#/world/core/player-types"
import type { Cell } from "#/world/protocol"
import type { Message } from "#/world/server/map-room/context"

type Props = Readonly<{ data: PlayerState; at: Cell; connectionId: string; message: Message<"join">; now: number }>

/** 保存済みの状態と入場地点から、接続へ反映する姿・経路・準備状態をまとめて作る。 */
export function getMapAdmissionPresence(props: Props) {
  return {
    player: mapPlayer(props.connectionId, props.data, props.at),
    ready: props.data.profileComplete,
    owner: props.message.player,
    route: [props.at],
    since: props.now,
    held: props.message.time ?? null,
    down: props.data.hp <= 0,
    party: props.data.party,
    sitting: props.data.sitting,
  }
}
