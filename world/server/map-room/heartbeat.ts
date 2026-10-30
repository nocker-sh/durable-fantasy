import { Nature } from "#/durable-objects/nature"
import { NODES } from "#/world/core/gather"
import { Wild } from "#/durable-objects/wild"
import { Player } from "#/durable-objects/player"
import { spawnsOn } from "#/world/core/spawns-on"
import type { Handlers } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"
import { reachable } from "#/world/server/map-room/reachable"
import { notifyClient } from "#/world/server/map-room/notifications"

export const HANDLERS: Handlers = {
  async heartbeat(inputProps) {
    const ctx = inputProps.ctx
    const key = inputProps.key
    const me = inputProps.me
    const save = inputProps.save

    const owner = me.owner
    if (!me.player || !owner || me.ready === false || me.closed) return
    const now = Date.now()
    const checkDelivery = me.deliveryCheckedAt === undefined || now - me.deliveryCheckedAt >= 5000
    const checkWild = spawnsOn(key.map).length > 0 && (me.wildCheckedAt === undefined || now - me.wildCheckedAt >= 5000)
    const checkNature = NODES.some((node) => node.map === key.map) && (me.natureCheckedAt === undefined || now - me.natureCheckedAt >= 5000)
    if (!checkDelivery && !checkWild && !checkNature) return
    // Bound attempts too: an unavailable object must not turn repeated heartbeats into an RPC loop.
    save({ ...(checkDelivery ? { deliveryCheckedAt: now } : {}), ...(checkWild ? { wildCheckedAt: now } : {}), ...(checkNature ? { natureCheckedAt: now } : {}) })
    const refreshDelivery = async () => {
      const delivery = await Player.get(owner).deliveryUpdate(me.deliveryRevision ?? null)
      if (presence(ctx.connection).closed) return
      let delivered = true
      if (delivery.player) {
        save({ sitting: delivery.player.sitting })
        if (delivery.player.hp <= 0) save({ down: true, route: [reachable(me).at(-1)!], since: now })
        delivered = await notifyClient(ctx.connection.send({ type: "result", seq: -1, result: { ok: true, state: delivery.player, events: [] } }))
      }
      if (delivered) save({ deliveryRevision: delivery.revision })
    }
    const refreshWild = async () => {
      const snapshot = await Wild.get(ctx.params.mapId).snapshot(key.map)
      if (presence(ctx.connection).closed) return
      // Recovery is authoritative: elapsed client time alone cannot revive a creature.
      await notifyClient(ctx.connection.send({ type: "wild", ...snapshot }))
    }
    const refreshNature = async () => {
      const left = await Nature.get(`town-${key.world}`).left(key.map)
      if (presence(ctx.connection).closed || !Object.keys(left).length) return
      await notifyClient(ctx.connection.send({ type: "nodes", left }))
    }
    const refreshes = await Promise.allSettled([...(checkDelivery ? [refreshDelivery()] : []), ...(checkWild ? [refreshWild()] : []), ...(checkNature ? [refreshNature()] : [])])
    // Persisted-state failures remain errors, but cannot suppress or delay an independent refresh.
    for (const refresh of refreshes) if (refresh.status === "rejected") throw refresh.reason
  },
}
