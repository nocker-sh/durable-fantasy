// One Durable Object per player holds their data (game-system.md §13). Commands run one at a time here, so two
// purchases sent at once can never both spend the same gold.
import { defineDurableState } from "void/durable"
import { locationAt, townLocation, type PlayerLocation } from "../world/core/location.ts"
import type { Cell } from "../world/protocol.ts"
import { apply, type Context, type Transition } from "#/world/core/apply.ts"
import type { Command, ServerCommand } from "#/world/core/commands.ts"
import { loadPlayer, newPlayer, settle, type PlayerState } from "#/world/core/player.ts"
import { derive } from "#/world/core/stats.ts"
import { addItem } from "#/world/core/bag.ts"
import { prepareTrade, finishTrade, type TradeProposal, type TradeRecord } from "../world/core/trade-transaction.ts"
import { beginTrade, advanceTrade, type TradeJob, type TradeParticipant, type TradePeer } from "../world/server/trade-coordinator.ts"
import type { ItemId } from "#/world/core/items.ts"

export const Player = defineDurableState({
  initialState: {
    player: newPlayer() as PlayerState,
    credential: null as string | null,
    location: null as PlayerLocation | null,
    trade: null as TradeRecord | null,
    tradeJob: null as TradeJob | null,
  },
  version: 2,
  migrations: [
    { version: 1, migrate: (old) => ({ ...(old as { player: PlayerState; credential: string | null; location: PlayerLocation | null }), trade: null, tradeJob: null }) },
    { version: 2, migrate: (old) => ({ ...(old as TradeParticipant & { credential: string | null; location: PlayerLocation | null }), tradeJob: null }) },
  ],
  methods: {
    arrive(context, world: number, map: string, connection: string) {
      const now = Date.now()
      const location = context.state.location?.world === world ? context.state.location : townLocation(world, now)
      const at = locationAt(location, now)
      if (location.map !== map) return { map: location.map, at, accepted: false }
      context.state.location = { ...location, route: [at], since: now, connection }
      return { map, at, accepted: true }
    },
    ownsConnection(context, connection: string): boolean {
      return context.state.location?.connection === connection
    },
    walk(context, connection: string, route: Cell[], since = Date.now()): boolean {
      const location = context.state.location
      if (!location || location.connection !== connection || context.state.player.hp <= 0) return false
      context.state.location = { ...location, route, since }
      return true
    },
    travel(context, connection: string, map: string, at: Cell): boolean {
      const location = context.state.location
      if (!location || location.connection !== connection || context.state.player.hp <= 0) return false
      context.state.location = { ...location, map, route: [at], since: Date.now(), connection: null }
      return true
    },
    leave(context, connection: string) {
      const location = context.state.location
      if (location?.connection === connection) context.state.location = { ...location, route: [locationAt(location, Date.now())], since: Date.now(), connection: null }
    },
    claim(context, credential: string): boolean {
      if (context.state.credential) return context.state.credential === credential
      context.state.credential = credential
      return true
    },
    authenticate(context, credential: string): boolean {
      return !!context.state.credential && context.state.credential === credential
    },
    read(context): PlayerState {
      const p = loadPlayer(context.state.player)
      // HP that has come back since it was last counted
      context.state.player = settle(p, derive(p), Date.now())
      return context.state.player
    },
    async beginTrade(context, peer: string, local: TradeProposal, remote: TradeProposal): Promise<ReturnType<typeof beginTrade>> {
      const result = beginTrade(context.state, peer, local, remote, Date.now())
      if (result.ok && !result.job.finished) await context.setAlarm(Date.now() + 100)
      return result
    },
    tradeJob(context): TradeJob | null {
      return context.state.tradeJob
    },
    async advanceTrade(context): Promise<TradeJob | null> {
      await advancePlayerTrade(context, (id) => Player.get(id))
      return context.state.tradeJob
    },
    tradeStatus(context): TradeRecord | null {
      return context.state.trade
    },
    prepareTrade(context, proposal: TradeProposal): ReturnType<typeof prepareTrade> {
      const result = prepareTrade(loadPlayer(context.state.player), context.state.trade, proposal, Date.now())
      if (result.ok) context.state.trade = result.record
      return result
    },
    finishTrade(context, id: string, revision: number, decision: "committed" | "aborted"): Transition {
      const result = finishTrade(loadPlayer(context.state.player), context.state.trade, id, revision, decision)
      if (!result.ok) return result
      // Both fields are persisted together by Void, including when a retry finds a final record.
      context.state.player = result.player
      context.state.trade = result.record
      return { ok: true, state: result.player, events: [] }
    },
    /** Run a command; the room passes the price the shop asks today, the time is the server's. */
    run(context, command: Command | ServerCommand, ctx: Omit<Context, "now"> = {}): Transition {
      if (context.state.trade?.status === "prepared") return { ok: false, reason: "NOT_READY" }
      const now = Date.now()
      const result = apply(loadPlayer(context.state.player), command, { ...ctx, now })
      if (result.ok) {
        context.state.player = result.state
        const location = context.state.location
        if (result.state.hp <= 0 && location) {
          context.state.location = { ...location, route: [locationAt(location, now)], since: now }
        }
      }
      return result
    },
    /** Dev only: put things in the bag (checks and the debug panel). */
    give(context, item: ItemId, count: number): PlayerState {
      if (context.state.trade?.status === "prepared") throw new Error("Trade is pending")
      const p = loadPlayer(context.state.player)
      const bag = addItem(p.bag, item, count)
      if (bag) context.state.player = { ...p, bag }
      return context.state.player
    },
    /** Start over as a new traveller (the dev debug panel). */
    reset(context): PlayerState {
      if (context.state.trade?.status === "prepared") throw new Error("Trade is pending")
      context.state.player = newPlayer()
      context.state.location = null
      return context.state.player
    },
  },
  async alarm(context) {
    await advancePlayerTrade(context, (id) => Player.get(id))
  },
})

async function advancePlayerTrade(context: { state: TradeParticipant; setAlarm(at: number): Promise<void> }, peer: (id: string) => TradePeer): Promise<void> {
  const job = context.state.tradeJob
  if (!job || job.finished) return
  // Schedule recovery before crossing the RPC boundary. A failed state save leaves this retry armed.
  await context.setAlarm(Date.now() + 5000)
  await advanceTrade(context.state, peer(job.peer))
}

export default Player
