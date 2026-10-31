import { Nature } from "#/durable-objects/nature"
import { Wild } from "#/durable-objects/wild"
import { spawnsOn } from "#/world/core/spawns-on"
import type { JoinRequestContext } from "#/world/server/map-room/join-request-types"

type Resources =
  | { ok: true; left: Awaited<ReturnType<ReturnType<typeof Nature.get>["left"]>>; monsters: Awaited<ReturnType<ReturnType<typeof Wild.get>["snapshot"]>> | null }
  | { ok: false; error: unknown }

/** 初期通知と並行して読み、通知が先に失敗しても読取りの拒否を未処理の Promise にしない。 */
export async function readInitialMapResources(room: JoinRequestContext): Promise<Resources> {
  try {
    const wild = spawnsOn(room.key.map).length > 0
    const resources = await Promise.all([Nature.get(`town-${room.key.world}`).left(room.key.map), wild ? Wild.get(room.ctx.params.mapId).snapshot(room.key.map) : null])
    return { ok: true, left: resources[0], monsters: resources[1] }
  } catch (error) {
    return { ok: false, error }
  }
}
