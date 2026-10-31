// One room per map (game-system.md §1, §14). It knows where everyone on the map is, checks
// paths against the map's walk grid, checks distances for shops and warps, and runs commands on
// each player's data through their Player Durable Object. Who is where lives on the connections,
// so the room keeps nothing once the last player leaves.
import { standUp } from "#/world/server/map-room/stand-up"
import { defineRoom } from "void/ws"
import { KeyedQueue } from "#/lib/engine/keyed-queue"
import { Player } from "#/durable-objects/player"
import { Directory } from "#/durable-objects/directory"
import { parseRoom } from "#/world/parse-room"
import { MAPS } from "#/world/maps"
import { isMapId } from "#/world/maps/is-map-id"
import { isOpen } from "#/world/maps/is-open"
import { type MapDefinition } from "#/world/maps/types"
import { clientMessage, serverMessage } from "#/world/protocol"
import { HANDLERS } from "#/world/server/map-room/index"
import type { Ctx } from "#/world/server/map-room/context"
import type { Presence } from "#/world/server/map-room/presence"
import { presence } from "#/world/server/map-room/presence"
import { setTrade } from "#/world/server/map-room/set-trade"
import { authenticatedPlayer } from "#/world/server/authenticated-player"
import { sameOrigin } from "#/world/server/same-origin"

const messages = new KeyedQueue()

export default defineRoom({
  name: "map-room",
  messages: { client: clientMessage, server: serverMessage },
  async onBeforeConnect(ctx) {
    if (!sameOrigin(ctx.request) || !(await authenticatedPlayer(ctx.request))) return new Response("Unauthorized", { status: 401 })
    // the room is one channel of one map in one parallel town: "3~phanthiet~1" (channels.ts)
    const key = parseRoom(ctx.params.mapId)
    if (!key || !isMapId(key.map)) return new Response("No such map", { status: 404 })
    // a closed road's map (dev builds may still look at it, for checks)
    if (!import.meta.env.DEV && !isOpen(key.map)) return new Response("The road there is closed", { status: 403 })
  },
  async onConnect(ctx) {
    const owner = await authenticatedPlayer(ctx.request)
    ctx.connection.setState({ player: null, owner, route: [], since: 0, said: [], engaged: null } satisfies Presence)
  },
  async onMessage(ctx, message) {
    const receivedAt = Date.now()
    return messages.run(`${ctx.id}:${ctx.connection.id}`, async () => {
      const key = parseRoom(ctx.params.mapId)!
      const map: MapDefinition = MAPS[key.map]
      let me = presence(ctx.connection)
      if (me.closed) return
      if (message.type !== "join" && me.player && me.owner && !(await Player.get(me.owner).ownsConnection(ctx.connection.id))) {
        ctx.connection.close(4001, "Character opened elsewhere")
        return
      }
      me = presence(ctx.connection)
      if (me.closed) return
      // Creation is saved before this connection can participate in the world.
      if (me.ready === false && message.type !== "join" && !(message.type === "command" && message.command.type === "profile")) return
      const save = (patch: Partial<Presence>) => ctx.connection.setState({ ...presence(ctx.connection), ...patch } satisfies Presence)
      const handle = HANDLERS[message.type] as ((c: Ctx, m: typeof message) => Promise<void>) | undefined
      await handle?.({ ctx, key, map, me, save, standUp: () => standUp({ ctx, me, save }), receivedAt }, message)
    })
  },
  async onClose(ctx) {
    const me = presence(ctx.connection)
    ctx.connection.setState({ ...me, closed: true } satisfies Presence)
    // a trade with someone who left falls through
    const them = me.trade ? ctx.room.getConnection(me.trade.with) : undefined
    if (them && presence(them).trade?.with === ctx.connection.id) {
      setTrade(them, undefined)
      await them.send({ type: "trade-closed", reason: "LEFT" })
    }
    if (me.player) {
      if (me.owner) await Player.get(me.owner).leave(ctx.connection.id)
      const key = parseRoom(ctx.params.mapId)
      if (key) await Directory.get(`town-${key.world}`).depart(key.map, key.channel)
      await ctx.room.broadcast({ type: "left", id: me.player.id }, [ctx.connection.id])
    }
  },
})
