// The map room's handlers for joining, walking, talking, looking about, warping, coming to and engaging a resident.
import { mayVisit } from "../../core/threads.ts"
import { Player } from "../../../durable-objects/player.ts"
import { SHOPS, isShopId } from "../../core/shops.ts"
import { sellable } from "../../core/items.ts"
import { Market } from "../../../durable-objects/market.ts"
import { Wild } from "../../../durable-objects/wild.ts"
import { SPAWNS } from "../../core/monsters.ts"
import { Nature } from "../../../durable-objects/nature.ts"
import { Directory } from "../../../durable-objects/directory.ts"
import { MAPS, TALK_CELLS, cellDistance, isOpen, minutesToClose, npcCell, walkable } from "../../maps/index.ts"
import { HEARING_CELLS, validPath, type Cell, type MapPlayer } from "../../protocol.ts"
import type { Ctx, Handlers, Message } from "./context.ts"
import { TOWN, timeFor, presence, mapPlayer, reachable, near, atWarp } from "./presence.ts"

async function join(roomCtx: Ctx, message: Message<"join">) {
  const { ctx, key, map, me, save } = roomCtx
  if (me.player) return
  // count them in; a channel already over full sends them to another
  // the count and the player's record are asked for at once
  const [room, data] = await Promise.all([Directory.get(`town-${key.world}`).arrive(key.map, key.channel, !!message.following), Player.get(message.player).read()])
  if (!room) {
    await ctx.connection.send({ type: "refused", what: "join", reason: "FULL" })
    return
  }
  // only their own town, or a friend's whose thread they hold (dev builds may go anywhere, for checks)
  if (!import.meta.env.DEV && !mayVisit(message.player, data.threads, key.world)) {
    await Directory.get(`town-${key.world}`).depart(key.map, key.channel)
    await ctx.connection.send({ type: "refused", what: "join", reason: "NOT_YOUR_TOWN" })
    return
  }
  const at: Cell = walkable(map, message.at) ? message.at : (map.spawn as Cell)
  const player = mapPlayer(ctx.connection.id, data, at)
  save({ player, owner: message.player, route: [at], since: Date.now(), held: message.time ?? null, down: data.hp <= 0, party: data.party, sitting: data.sitting })
  const players: MapPlayer[] = []
  for (const other of ctx.room.getConnections()) {
    const them = presence(other).player
    if (them && other.id !== ctx.connection.id) players.push(them)
  }
  const wild = SPAWNS.some((s) => s.map === key.map)
  const rest = Promise.all([Nature.get(`town-${key.world}`).left(key.map), wild ? Wild.get(ctx.params.mapId).state(key.map) : null])
  await ctx.connection.send({ type: "snapshot", you: player.id, me: data, players })
  const [left, monsters] = await rest
  await ctx.connection.send({ type: "nodes", left })
  if (monsters) await ctx.connection.send({ type: "wild", monsters })
  await ctx.room.broadcast({ type: "joined", player }, [ctx.connection.id])
  return
}

async function move(roomCtx: Ctx, message: Message<"move">) {
  const { ctx, map, me, save, standUp } = roomCtx
  if (!me.player) return
  if (me.engaged || me.down || me.trade?.open || !validPath(reachable(me), message.path, (c) => walkable(map, c))) {
    await ctx.connection.send({ type: "refused", what: "move" })
    return
  }
  await standUp()
  const at = message.path[message.path.length - 1]
  save({ player: { ...me.player, at }, route: message.path, since: Date.now() })
  await ctx.room.broadcast({ type: "moved", id: me.player.id, path: message.path }, [ctx.connection.id])
  return
}

async function say(roomCtx: Ctx, message: Message<"say">) {
  const { ctx, me, save } = roomCtx
  if (!me.player) return
  // at most two lines a second
  const now = Date.now()
  const said = [...me.said.filter((t) => now - t < 1000), now]
  save({ said })
  if (said.length > 2) return
  const shout = !!message.shout
  const from = reachable(me)[0]
  for (const other of ctx.room.getConnections()) {
    const them = presence(other)
    if (other.id === ctx.connection.id || !them.player) continue
    if (shout || reachable(them).some((c) => cellDistance(c, from) <= HEARING_CELLS)) await other.send({ type: "said", id: me.player.id, text: message.text, shout })
  }
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
  // for now only the meadow and the forest are open beyond the town (game-system.md §1)
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
  await ctx.connection.send({ type: "warped", map: warp.to.map, at: warp.to.at as Cell })
  return
}

export const HANDLERS: Handlers = {
  join: join,
  move: move,
  say: say,
  engage: engage,
  revive: revive,
  look: look,
  warp: warp,
}
