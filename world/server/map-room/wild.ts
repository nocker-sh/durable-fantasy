import { Wild } from "../../../durable-objects/wild.ts"
import { spawnsOn } from "../../core/monsters.ts"
import type { Handlers } from "./context.ts"
import { presence } from "./presence.ts"
import { notifyClient } from "./notifications.ts"

export const HANDLERS: Handlers = {
  async heartbeat({ ctx, key, me, save }) {
    if (!me.player || me.ready === false || me.closed || spawnsOn(key.map).length === 0) return
    const now = Date.now()
    if (me.wildCheckedAt !== undefined && now - me.wildCheckedAt < 5_000) return
    const monsters = await Wild.get(ctx.params.mapId).state(key.map)
    if (presence(ctx.connection).closed) return
    save({ wildCheckedAt: now })
    // Recovery is authoritative: elapsed client time alone cannot revive a creature.
    await notifyClient(ctx.connection.send({ type: "wild", monsters }))
  },
}
