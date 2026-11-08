import type { CombatNotice } from "#/world/server/wild-coordinator"
import type { Ctx } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"
import { notifyClient } from "#/world/server/map-room/notifications"

type Connection = Pick<Ctx["ctx"]["connection"], "state" | "send">
type Props = Readonly<{ me: Pick<Ctx["me"], "owner">; ctx: { connection: Pick<Connection, "send">; room: { getConnections(): Iterable<Connection> } } }>

export async function notifyCombat(context: Props, notices: readonly CombatNotice[]): Promise<void> {
  const ctx = context.ctx
  const me = context.me

  for (const notice of notices) {
    const connection = notice.owner === me.owner ? ctx.connection : [...ctx.room.getConnections()].find((c) => presence(c).owner === notice.owner && !presence(c).closed)
    if (connection) await notifyClient(connection.send({ type: "result", seq: -1, result: notice.result }))
  }
}
