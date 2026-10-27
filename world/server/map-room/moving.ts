// The map room's handlers for joining, walking, looking about, warping, coming to and engaging a resident.
import { mayVisit } from "../../core/threads.ts"
import { Player } from "../../../durable-objects/player.ts"
import { SHOPS, isShopId } from "../../core/shops.ts"
import { sellable } from "../../core/items.ts"
import { Market } from "../../../durable-objects/market.ts"
import { Wild } from "../../../durable-objects/wild.ts"
import { spawnsOn } from "../../core/monsters.ts"
import { Nature } from "../../../durable-objects/nature.ts"
import { Directory } from "../../../durable-objects/directory.ts"
import { MAPS, TALK_CELLS, isOpen, minutesToClose, npcCell, walkable } from "../../maps/index.ts"
import { validPath, cellsReached, type Cell, type MapPlayer } from "../../protocol.ts"
import type { Ctx, Handlers, Message } from "./context.ts"
import { TOWN, timeFor, presence, mapPlayer, reachable, near, atWarp } from "./presence.ts"

async function join(roomCtx: Ctx, message: Message<"join">) {
  const { ctx, key, map, me, save } = roomCtx
  if (me.player || me.joining || !me.owner || message.player !== me.owner) return
  save({ joining: true })
  let counted = false
  let admitted = false
  try {
    // count them in; a channel already over full sends them to another
    // Read first so a failed read cannot leave an incremented channel count.
    const data = await Player.get(me.owner).read()
    const room = await Directory.get(`town-${key.world}`).arrive(key.map, key.channel, !!message.following)
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
    const arrival = await Player.get(me.owner).arrive(key.world, key.map, ctx.connection.id)
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
    const rest = Promise.all([Nature.get(`town-${key.world}`).left(key.map), wild ? Wild.get(ctx.params.mapId).state(key.map) : null])
    await ctx.connection.send({ type: "snapshot", you: player.id, me: data, players, at })
    const [left, monsters] = await rest
    if (presence(ctx.connection).closed) return
    await ctx.connection.send({ type: "nodes", left })
    if (monsters) await ctx.connection.send({ type: "wild", monsters })
    if (data.profileComplete) await ctx.room.broadcast({ type: "joined", player }, [ctx.connection.id])
    return
  } finally {
    if (counted && !admitted) await Directory.get(`town-${key.world}`).depart(key.map, key.channel)
    save({ joining: false })
  }
}

async function move(roomCtx: Ctx, message: Message<"move">) {
  const { ctx, map, me, save, standUp } = roomCtx
  if (!me.player) return
  const since = roomCtx.receivedAt ?? Date.now()
  const reached = cellsReached(me.route, Math.max(0, since - me.since) / 1000)
  if (me.engaged || me.down || me.trade?.open || !validPath(reached, message.path, (c) => walkable(map, c))) {
    const at = reachable(me)[0]
    if (me.owner && (await Player.get(me.owner).walk(ctx.connection.id, [at]))) {
      save({ player: { ...me.player, at }, route: [at], since: Date.now() })
      await ctx.room.broadcast({ type: "moved", id: me.player.id, path: [at] }, [ctx.connection.id])
    }
    await ctx.connection.send({ type: "refused", what: "move", at })
    return
  }
  await standUp()
  if (!me.owner || !(await Player.get(me.owner).walk(ctx.connection.id, message.path, since))) return
  const at = message.path[message.path.length - 1]
  save({ player: { ...me.player, at }, route: message.path, since })
  await ctx.room.broadcast({ type: "moved", id: me.player.id, path: message.path }, [ctx.connection.id])
  return
}

async function engage(roomCtx: Ctx, message: Message<"engage">) {
  const { ctx, map, me, save } = roomCtx
  if (!me.player) return
  const cell = message.npc ? npcCell(map, message.npc, timeFor(me)) : null
  if (message.npc && (!cell || !near(me, cell as Cell, TALK_CELLS + 1))) {
    await ctx.connection.send({ type: "refused", what: "engage" })
    return
  }
  // stop where the player stands now
  const here = [...reachable(me).at(-1)!] as Cell
  save({ engaged: message.npc, ...(message.npc ? { route: [here], since: Date.now(), player: { ...me.player, at: here } } : {}) })
  return
}

async function revive(roomCtx: Ctx, _message: Message<"revive">) {
  const { ctx, me, save } = roomCtx
  if (!me.player || !me.owner || !me.down) return
  const result = await Player.get(me.owner).run({ type: "revive" })
  await ctx.connection.send({ type: "result", seq: -1, result })
  if (!result.ok) return
  save({ down: false })
  // they come to where they last made their home in town
  if (!(await Player.get(me.owner).travel(ctx.connection.id, result.state.savePoint.map, result.state.savePoint.cell as Cell))) return
  await ctx.connection.send({ type: "warped", map: result.state.savePoint.map, at: result.state.savePoint.cell as Cell })
  return
}

async function look(roomCtx: Ctx, message: Message<"look">) {
  const { ctx, map, me } = roomCtx
  if (!me.player || !isShopId(message.shop)) return
  const shop = message.shop
  const open = SHOPS[shop].keepers.map((name) => npcCell(map, name, timeFor(me))).filter((c): c is Cell => !!c)
  if (!open.some((c) => near(me, c, TALK_CELLS + 1))) return
  const offers = await Market.get(TOWN).look(shop, minutesToClose(shop, timeFor(me)))
  const carried = me.owner ? [...new Set((await Player.get(me.owner).read()).bag.flatMap((s) => (s && sellable(s.item) ? [s.item] : [])))] : []
  await ctx.connection.send({ type: "stock", shop, offers, buys: await Market.get(TOWN).buying(shop, carried) })
  return
}

async function warp(roomCtx: Ctx, message: Message<"warp">) {
  const { ctx, map, me } = roomCtx
  const warp = map.warps[message.warp]
  if (!me.player || me.engaged || me.trade?.open || !warp || !atWarp(me, warp.at as Cell)) {
    await ctx.connection.send({ type: "refused", what: "warp" })
    return
  }
  // Only checked, playable destinations may be entered (game-system.md §1).
  if (!isOpen(warp.to.map)) {
    await ctx.connection.send({ type: "refused", what: "warp", reason: "ROAD_CLOSED" })
    return
  }
  // the road out of town is tiring (game-system.md §3.6); with nothing left you cannot go on
  if (MAPS[warp.to.map]?.kind === "field" && me.owner) {
    const tired = await Player.get(me.owner).run({ type: "tire", amount: 4 })
    if (!tired.ok) {
      await ctx.connection.send({ type: "refused", what: "warp", reason: tired.reason })
      return
    }
  }
  if (!me.owner || !(await Player.get(me.owner).travel(ctx.connection.id, warp.to.map, warp.to.at as Cell))) return
  await ctx.connection.send({ type: "warped", map: warp.to.map, at: warp.to.at as Cell })
  return
}

export const HANDLERS: Handlers = {
  join: join,
  move: move,
  engage: engage,
  revive: revive,
  look: look,
  warp: warp,
}
