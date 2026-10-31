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
import { validPath } from "#/world/valid-path"
import { cellsReached } from "#/world/cells-reached"
import type { Cell, MapPlayer } from "#/world/protocol"
import type { Ctx, Handlers, Message } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { reachable } from "#/world/server/map-room/reachable"
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

async function move(roomCtx: Ctx, message: Message<"move">) {
  const ctxSource2 = roomCtx,
    ctx = ctxSource2.ctx,
    map = ctxSource2.map,
    me = ctxSource2.me,
    save = ctxSource2.save,
    standUp = ctxSource2.standUp
  if (!me.player) return
  const since = roomCtx.receivedAt ?? Date.now()
  const reached = cellsReached(me.route, Math.max(0, since - me.since) / 1000)
  if (me.engaged || me.down || me.trade?.open || !validPath(reached, message.path, (c) => walkable(map, c))) {
    const at = reachable(me)[0]
    if (me.owner && (await Player.get(me.owner).walk({ connection: ctx.connection.id, route: [at] }))) {
      save({ player: { ...me.player, at }, route: [at], since: Date.now() })
      await ctx.room.broadcast({ type: "moved", id: me.player.id, path: [at] }, [ctx.connection.id])
    }
    await ctx.connection.send({ type: "refused", what: "move", at })
    return
  }
  if (!(await standUp())) {
    await ctx.connection.send({ type: "refused", what: "move", at: reachable(me)[0] })
    return
  }
  if (!me.owner || !(await Player.get(me.owner).walk({ connection: ctx.connection.id, route: message.path, since: since }))) return
  const at = message.path[message.path.length - 1]
  save({ player: { ...me.player, at }, route: message.path, since })
  await ctx.room.broadcast({ type: "moved", id: me.player.id, path: message.path }, [ctx.connection.id])
  return
}

export const HANDLERS: Handlers = {
  join: join,
  move: move,
  engage: handleEngage,
  revive: handleRevive,
  look: handleShopLook,
  warp: handleWarp,
}
