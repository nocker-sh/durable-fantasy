import type { CombatNotice } from "#/world/server/wild-coordinator"
import type { Ctx } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"
import { notifyClient } from "#/world/server/map-room/notifications"

export async function notifyCombat(context: Pick<Ctx, "ctx" | "me">, notices: CombatNotice[]): Promise<void> {
  const ctx = context.ctx
  const me = context.me

  for (const notice of notices) {
    const connection = notice.owner === me.owner ? ctx.connection : [...ctx.room.getConnections()].find((c) => presence(c).owner === notice.owner && !presence(c).closed)
    if (connection) await notifyClient(connection.send({ type: "result", seq: -1, result: notice.result }))
  }
}
