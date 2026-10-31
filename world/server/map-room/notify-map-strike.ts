import { notifyClient } from "#/world/server/map-room/notifications"
import type { Ctx } from "#/world/server/map-room/context"
import type { PreparedMapAttack } from "#/world/server/map-room/attack-types"
import type { StrikeResult } from "#/world/server/wild-coordinator"

/** 命中の公開順も届けるが、配送の失敗で保存済みの戦闘を取り消さない。 */
export async function notifyMapStrike(room: Pick<Ctx, "ctx">, attack: PreparedMapAttack, result: StrikeResult): Promise<void> {
  await notifyClient(
    room.ctx.room.broadcast({
      type: "struck",
      by: attack.playerId,
      monster: attack.spawn.id,
      swing: attack.blow,
      hp: result.hp,
      back: result.back,
      ...(result.revision !== undefined ? { revision: result.revision } : {}),
    }),
  )
}
