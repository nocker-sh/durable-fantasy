import { receiveGather } from "#/world/core/receive-gather"
import type { GatherRequest } from "#/world/core/gather-receipt-types"
import { receiveShop } from "#/world/core/receive-shop"
import type { ShopQuote } from "#/world/core/shop-receipt-types"
// One Durable Object per player holds their data (game-system.md §13). Commands run one at a time here, so two
// purchases sent at once can never both spend the same gold.
import { defineDurableState } from "void/durable"
import { locationAt } from "#/world/core/location-at"
import { townLocation } from "#/world/core/town-location"
import type { Cell } from "#/world/protocol"
import { apply } from "#/world/core/apply"
import type { Context } from "#/world/core/apply"
import type { Transition } from "#/world/core/transition"
import type { Command, ServerCommand } from "#/world/core/commands"
import { newPlayer } from "#/world/core/new-player"
import type { PlayerState } from "#/world/core/player-types"
import { addItem } from "#/world/core/add-item"
import { prepareTrade } from "#/world/core/prepare-trade"
import { finishTrade } from "#/world/core/finish-trade"
import type { TradeProposal, TradeRecord } from "#/world/core/trade-transaction-types"
import { beginTrade } from "#/world/server/begin-trade"
import { advanceTrade } from "#/world/server/advance-trade"
import type { TradeJob, TradePeer } from "#/world/server/trade-coordinator"
import type { OrderIntent } from "#/world/core/exchange-types"
import { holdOrder } from "#/world/core/hold-order"
import { receiveInbox } from "#/world/core/receive-inbox"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { playerMigrations } from "#/world/server/player-record"
import { restoreSavedPlayer } from "#/world/server/restore-saved-player"
import { readPlayerRecord } from "#/world/server/read-player-record"
import { advanceCombatLife } from "#/world/server/advance-combat-life"
import { publishPlayer } from "#/world/server/publish-player"
import type { PlayerRecord } from "#/world/server/player-record"
import { receiveCombat } from "#/world/core/receive-combat"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import { payStrike } from "#/world/core/combat-payment"
import type { SkillId } from "#/world/core/skill-types"
import type { ItemId } from "#/world/core/items/catalog"

export const Player = defineDurableState({
  initialState: initialPlayerRecord,
  version: 8,
  migrations: playerMigrations,
  methods: {
    arrive(context, input: { world: number; map: string; connection: string }) {
      const world = input.world
      const map = input.map
      const connection = input.connection

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
    walk(context, input: { connection: string; route: Cell[]; since?: number }): boolean {
      const connection = input.connection
      const route = input.route
      const since = input.since === undefined ? Date.now() : input.since

      const location = context.state.location
      if (!location || location.connection !== connection || context.state.player.hp <= 0) return false
      context.state.location = { ...location, route, since }
      return true
    },
    travel(context, input: { connection: string; map: string; at: Cell }): boolean {
      const connection = input.connection
      const map = input.map
      const at = input.at

      const location = context.state.location
      if (!location || location.connection !== connection || context.state.player.hp <= 0) return false
      context.state.location = { ...location, map, route: [at], since: Date.now(), connection: null }
      return true
    },
    reviveAtHome(context, connection: string): Transition {
      const location = context.state.location
      if (!location || location.connection !== connection || context.state.trade?.status === "prepared") return { ok: false, reason: "NOT_READY" }
      const now = Date.now()
      const result = apply(restoreSavedPlayer(context.state.player), { type: "revive" }, { now })
      if (!result.ok) return result
      publishPlayer(context.state, result.state)
      advanceCombatLife(context.state)
      const home = result.state.savePoint
      context.state.location = { ...location, map: home.map, route: [home.cell as Cell], since: now, connection: null }
      return { ...result, state: context.state.player }
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
      return readPlayerRecord(context.state, Date.now())
    },
    async beginTrade(context, input: { peer: string; local: TradeProposal; remote: TradeProposal }): Promise<ReturnType<typeof beginTrade>> {
      const peer = input.peer
      const local = input.local
      const remote = input.remote

      context.state.player = restoreSavedPlayer(context.state.player)
      const result = beginTrade({ state: context.state, peer: peer, local: local, remote: remote, now: Date.now() })
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
      const result = prepareTrade({ player: restoreSavedPlayer(context.state.player), previous: context.state.trade, proposal, now: Date.now() })
      if (result.ok) context.state.trade = result.record
      return result
    },
    finishTrade(context, input: { id: string; revision: number; decision: "committed" | "aborted" }): Transition {
      const id = input.id
      const revision = input.revision
      const decision = input.decision

      const result = finishTrade({ player: restoreSavedPlayer(context.state.player), record: context.state.trade, id, revision, decision })
      if (!result.ok) return result
      // Both fields are persisted together by Void, including when a retry finds a final record.
      publishPlayer(context.state, result.player)
      context.state.trade = result.record
      return { ok: true, state: context.state.player, events: [] }
    },
    holdOrder(context, id: number, intent: OrderIntent): Transition & { by?: string } {
      if (context.state.trade?.status === "prepared" && context.state.orderEscrow?.id !== id) return { ok: false, reason: "NOT_READY" }
      const result = holdOrder({ player: restoreSavedPlayer(context.state.player), previous: context.state.orderEscrow, id, intent, now: Date.now() })
      if (!result.ok) return result
      publishPlayer(context.state, result.state, context.state.orderEscrow?.id !== result.receipt.id)
      context.state.orderEscrow = result.receipt
      return { ok: true, state: context.state.player, events: result.events, ...(result.receipt.by !== undefined ? { by: result.receipt.by } : {}) }
    },
    readCombat(context) {
      return { player: readPlayerRecord(context.state, Date.now()), life: context.state.combatLife }
    },
    deliveryUpdate(context, after: number | null) {
      const player = restoreSavedPlayer(context.state.player)
      return { revision: context.state.deliveryRevision, player: after === context.state.deliveryRevision ? null : player }
    },
    receiveGather(context, source: string, request: GatherRequest): Transition {
      if (!source) return { ok: false, reason: "NOT_READY" }
      const received = receiveGather({
        player: restoreSavedPlayer(context.state.player),
        previous: context.state.gatherReceipts[source],
        request,
        now: Date.now(),
        reserved: context.state.trade?.status === "prepared",
      })
      if (received.receipt) context.state.gatherReceipts[source] = received.receipt
      if (received.result.ok) publishPlayer(context.state, received.result.state, !!received.receipt)
      return received.result.ok ? { ...received.result, state: context.state.player } : received.result
    },
    receiveShop(context, source: string, quote: ShopQuote): Transition {
      if (!source) return { ok: false, reason: "NOT_READY" }
      const received = receiveShop({
        player: restoreSavedPlayer(context.state.player),
        previous: context.state.shopReceipts[source],
        quote,
        now: Date.now(),
        reserved: context.state.trade?.status === "prepared",
      })
      if (received.receipt) context.state.shopReceipts[source] = received.receipt
      if (received.result.ok) publishPlayer(context.state, received.result.state, !!received.receipt)
      return received.result.ok ? { ...received.result, state: context.state.player } : received.result
    },
    receiveCombat(context, source: string, delivery: CombatDelivery): Transition {
      if (!source) return { ok: false, reason: "NOT_READY" }
      const now = Date.now()
      const received = receiveCombat({
        player: restoreSavedPlayer(context.state.player),
        previous: context.state.combatReceipts[source],
        delivery,
        now,
        reserved: context.state.trade?.status === "prepared",
        life: context.state.combatLife,
      })
      if (received.receipt) context.state.combatReceipts[source] = received.receipt
      if (received.result.ok) {
        publishPlayer(context.state, received.result.state, !!received.receipt)
        const location = context.state.location
        if (received.result.state.hp <= 0 && location) context.state.location = { ...location, route: [locationAt(location, now)], since: now }
      }
      return received.result.ok ? { ...received.result, state: context.state.player } : received.result
    },
    payStrike(context, input: { source: string; id: number; art?: SkillId; life?: number }): Transition {
      const source = input.source
      const id = input.id
      const art = input.art
      const life = input.life

      if (!source) return { ok: false, reason: "NOT_READY" }
      const resultSource = payStrike({
          player: restoreSavedPlayer(context.state.player),
          previous: context.state.combatPayments[source],
          request: { id, art, life },
          context: { now: Date.now(), reserved: context.state.trade?.status === "prepared", life: context.state.combatLife },
        }),
        result = resultSource.result,
        receipt = resultSource.receipt
      if (receipt) context.state.combatPayments[source] = receipt
      if (result.ok) publishPlayer(context.state, result.state, !!art && !!receipt)
      return result.ok ? { ...result, state: context.state.player } : result
    },
    inboxReceipt(context, id: number): Transition | null {
      return context.state.exchangeReceipt?.id === id ? { ok: true, state: restoreSavedPlayer(context.state.player), events: [] } : null
    },
    receiveInbox(context, claim: InboxClaim): Transition {
      if (context.state.trade?.status === "prepared" && context.state.exchangeReceipt?.id !== claim.id) return { ok: false, reason: "NOT_READY" }
      const result = receiveInbox({ player: restoreSavedPlayer(context.state.player), previous: context.state.exchangeReceipt, claim: claim, now: Date.now() })
      if (!result.ok) return result
      publishPlayer(context.state, result.state, context.state.exchangeReceipt?.id !== result.receipt.id)
      context.state.exchangeReceipt = result.receipt
      return { ok: true, state: context.state.player, events: result.events }
    },
    /** Run a command; the room passes the price the shop asks today, the time is the server's. */
    run(context, command: Command | ServerCommand, ctx: Omit<Context, "now"> = {}): Transition {
      if (context.state.trade?.status === "prepared") return { ok: false, reason: "NOT_READY" }
      const now = Date.now()
      const result = apply(restoreSavedPlayer(context.state.player), command, { ...ctx, now })
      if (result.ok) {
        publishPlayer(context.state, result.state)
        if (command.type === "revive") advanceCombatLife(context.state)
        const location = context.state.location
        if (result.state.hp <= 0 && location) {
          context.state.location = { ...location, route: [locationAt(location, now)], since: now }
        }
      }
      return result.ok ? { ...result, state: context.state.player } : result
    },
    /** Dev only: put things in the bag (checks and the debug panel). */
    give(context, item: ItemId, count: number): PlayerState {
      if (context.state.trade?.status === "prepared") throw new Error("Trade is pending")
      const p = restoreSavedPlayer(context.state.player)
      const bag = addItem({ bag: p.bag, item: item, count: count })
      publishPlayer(context.state, bag ? { ...p, bag } : p)
      return context.state.player
    },
    /** Start over as a new traveller (the dev debug panel). */
    reset(context): PlayerState {
      if (context.state.trade?.status === "prepared") throw new Error("Trade is pending")
      advanceCombatLife(context.state)
      publishPlayer(context.state, newPlayer())
      context.state.location = null
      return context.state.player
    },
  },
  async alarm(context) {
    await advancePlayerTrade(context, (id) => Player.get(id))
  },
})

async function advancePlayerTrade(context: { state: PlayerRecord; setAlarm(at: number): Promise<void> }, peer: (id: string) => TradePeer): Promise<void> {
  const job = context.state.tradeJob
  if (!job || job.finished) return
  context.state.player = restoreSavedPlayer(context.state.player)
  // Schedule recovery before crossing the RPC boundary. A failed state save leaves this retry armed.
  await context.setAlarm(Date.now() + 5000)
  const before = context.state.player
  await advanceTrade(context.state, peer(job.peer))
  if (context.state.player !== before) publishPlayer(context.state, restoreSavedPlayer(context.state.player))
}

export default Player
