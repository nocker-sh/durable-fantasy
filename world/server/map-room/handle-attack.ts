import { spawnOf } from "#/world/core/spawn-of"
import { prepareMapAttack } from "#/world/server/map-room/prepare-map-attack"
import { executeMapAttack } from "#/world/server/map-room/execute-map-attack"
import type { Ctx, Message } from "#/world/server/map-room/context"

/** 接続と対象のマップを先に確認し、予約と結果配送を保存先へ進める。 */
export async function handleAttack(room: Ctx, message: Message<"attack">): Promise<void> {
  const me = room.me
  if (!me.player || !me.owner || me.engaged || me.down || me.trade?.open) return
  const spawn = spawnOf(message.monster)
  if (!spawn || spawn.map !== room.key.map) return
  const attack = await prepareMapAttack({ room, message, owner: me.owner, playerId: me.player.id, spawn })
  if (attack) await executeMapAttack(room, message, attack)
}
