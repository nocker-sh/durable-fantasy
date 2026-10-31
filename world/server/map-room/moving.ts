import { handleEngage } from "#/world/server/map-room/handle-engage"
import { handleShopLook } from "#/world/server/map-room/handle-shop-look"
// The map room's handlers for joining, walking, looking about, warping, coming to and engaging a resident.
import { mayVisit } from "#/world/core/may-visit"
import { Player } from "#/durable-objects/player"
import { Wild } from "#/durable-objects/wild"
import { spawnsOn } from "#/world/core/spawns-on"
import { Nature } from "#/durable-objects/nature"
import { Directory } from "#/durable-objects/directory"
import { walkable } from "#/world/maps/walkable"
import type { Cell, MapPlayer } from "#/world/protocol"
import type { Ctx, Handlers, Message } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { handleMove } from "#/world/server/map-room/handle-move"
import { handleWarp } from "#/world/server/map-room/handle-warp"
import { handleRevive } from "#/world/server/map-room/handle-revive"

async function join(roomCtx: Ctx, message: Message<"join">) {
  const ctxSource = roomCtx,
    ctx = ctxSource.ctx,
    key = ctxSource.key,
    map = ctxSource.map,
    me = ctxSource.me,
    save = ctxSource.save
  if (me.player || me.joining || !me.owner || message.player !== me.owner) return
  save({ joining: true })
  let counted = false
  let admitted = false
  try {
    // count them in; a channel already over full sends them to another
    // Read first so a failed read cannot leave an incremented channel count.
    const data = await Player.get(me.owner).read()
    const room = await Directory.get(`town-${key.world}`).arrive({ map: key.map, channel: key.channel, following: !!message.following })
    counted = !!room
    if (!room) {
      await ctx.connection.send({ type: "refused", what: "join", reason: "FULL" })
      return
    }
    // only their own town, or a friend's whose thread they hold (dev builds may go anywhere, for checks)
    if (!import.meta.env.DEV && !mayVisit(message.player, data.threads, key.world)) {
      await ctx.connection.send({ type: "refused", what: "join", reason: "NOT_YOUR_TOWN" })
      return
    }
    if (presence(ctx.connection).closed) return
    const arrival = await Player.get(me.owner).arrive({ world: key.world, map: key.map, connection: ctx.connection.id })
    if (presence(ctx.connection).closed) {
      await Player.get(me.owner).leave(ctx.connection.id)
      return
    }
    if (!arrival.accepted) {
      await ctx.connection.send({ type: "warped", map: arrival.map, at: arrival.at })
      return
    }
    const at: Cell = walkable(map, arrival.at) ? arrival.at : (map.spawn as Cell)
    const player = mapPlayer(ctx.connection.id, data, at)
    save({ player, ready: data.profileComplete, owner: message.player, route: [at], since: Date.now(), held: message.time ?? null, down: data.hp <= 0, party: data.party, sitting: data.sitting })
    admitted = true
    const players: MapPlayer[] = []
    for (const other of ctx.room.getConnections()) {
      const otherPresence = presence(other)
      if (other.id !== ctx.connection.id && otherPresence.owner === me.owner && otherPresence.player) {
        other.close(4001, "Character opened elsewhere")
        continue
      }
      const them = otherPresence.ready === false ? null : otherPresence.player
      if (them && other.id !== ctx.connection.id) players.push(them)
    }
    const wild = spawnsOn(key.map).length > 0
    const rest = Promise.all([Nature.get(`town-${key.world}`).left(key.map), wild ? Wild.get(ctx.params.mapId).snapshot(key.map) : null])
    await ctx.connection.send({ type: "snapshot", you: player.id, me: data, players, at })
    const leftState = await rest,
      left = leftState[0],
      monsters = leftState[1]
    if (presence(ctx.connection).closed) return
    await ctx.connection.send({ type: "nodes", left })
    if (monsters) await ctx.connection.send({ type: "wild", ...monsters })
    if (data.profileComplete) await ctx.room.broadcast({ type: "joined", player }, [ctx.connection.id])
    return
  } finally {
    if (counted && !admitted) await Directory.get(`town-${key.world}`).depart(key.map, key.channel)
    save({ joining: false })
  }
}

export const HANDLERS: Handlers = {
  join: join,
  move: handleMove,
  engage: handleEngage,
  revive: handleRevive,
  look: handleShopLook,
  warp: handleWarp,
}
