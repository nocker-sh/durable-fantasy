import { Directory } from "#/durable-objects/directory"
import type { JoinRequestContext, MapAdmissionProgress } from "#/world/server/map-room/join-request-types"

/** 入場しなかった定員を戻す。返却が失敗しても入場中のフラグは外し、失敗を呼出し元へ返す。 */
export async function finishMapAdmission(room: JoinRequestContext, progress: MapAdmissionProgress): Promise<void> {
  try {
    if (progress.counted && !progress.admitted) await Directory.get(`town-${room.key.world}`).depart(room.key.map, room.key.channel)
  } finally {
    room.save({ joining: false })
  }
}
