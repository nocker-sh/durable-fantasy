// One room per map (game-system.md §1, §14). It knows where everyone on the map is, checks
// paths against the map's walk grid, checks distances for shops and warps, and runs commands on
// each player's data through their Player Durable Object. Who is where lives on the connections,
// so the room keeps nothing once the last player leaves.
import { defineRoom } from "void/ws";
import { Player } from "../../durable-objects/player.ts";
import { Directory } from "../../durable-objects/directory.ts";
import { parseRoom } from "#/world/channels.ts";
import { MAPS, isMapId, isOpen, type MapDefinition } from "#/world/maps/index.ts";
import { clientMessage, serverMessage } from "#/world/protocol.ts";
import { HANDLERS } from "#/world/server/map-room/index.ts";
import type { Ctx } from "#/world/server/map-room/context.ts";
import { type Presence, presence, setTrade } from "#/world/server/map-room/presence.ts";

export default defineRoom({
  name: "map-room",
  messages: { client: clientMessage, server: serverMessage },
  onBeforeConnect(ctx) {
    // the room is one channel of one map in one parallel town: "3~phanthiet~1" (channels.ts)
    const key = parseRoom(ctx.params.mapId);
    if (!key || !isMapId(key.map)) return new Response("No such map", { status: 404 });
    // a closed road's map (dev builds may still look at it, for checks)
    if (!import.meta.env.DEV && !isOpen(key.map)) return new Response("The road there is closed", { status: 403 });
  },
  onConnect(ctx) {
    ctx.connection.setState({ player: null, owner: null, route: [], since: 0, said: [], engaged: null } satisfies Presence);
  },
  async onMessage(ctx, message) {
    const key = parseRoom(ctx.params.mapId)!;
    const map: MapDefinition = MAPS[key.map];
    const me = presence(ctx.connection);
    const save = (patch: Partial<Presence>) => ctx.connection.setState({ ...presence(ctx.connection), ...patch } satisfies Presence);
    /** Someone sitting gets up before they walk off or strike. */
    const standUp = async () => {
      if (!me.sitting || !me.owner) return;
      save({ sitting: false });
      await ctx.connection.send({ type: "result", seq: -1, result: await Player.get(me.owner).run({ type: "stand" }) });
    };
    const handle = HANDLERS[message.type] as ((c: Ctx, m: typeof message) => Promise<void>) | undefined;
    await handle?.({ ctx, key, map, me, save, standUp }, message);
  },
  async onClose(ctx) {
    const me = presence(ctx.connection);
    // a trade with someone who left falls through
    const them = me.trade ? ctx.room.getConnection(me.trade.with) : undefined;
    if (them && presence(them).trade?.with === ctx.connection.id) {
      setTrade(them, undefined);
      await them.send({ type: "trade-closed", reason: "LEFT" });
    }
    if (me.player) {
      const key = parseRoom(ctx.params.mapId);
      if (key) await Directory.get(`town-${key.world}`).depart(key.map, key.channel);
      await ctx.room.broadcast({ type: "left", id: me.player.id }, [ctx.connection.id]);
    }
  },
});
