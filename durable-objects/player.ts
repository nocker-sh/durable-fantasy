import { defineDurableState } from "void/durable"
import { arrivePlayer } from "#/world/server/arrive-player"
import { walkPlayer } from "#/world/server/walk-player"
import { travelPlayer } from "#/world/server/travel-player"
import { leavePlayer } from "#/world/server/leave-player"
import { revivePlayerAtHome } from "#/world/server/revive-player-at-home"
import { beginPlayerTrade } from "#/world/server/begin-player-trade"
import { advancePlayerTrade } from "#/world/server/advance-player-trade"
import { preparePlayerTrade } from "#/world/server/prepare-player-trade"
import { finishPlayerTrade } from "#/world/server/finish-player-trade"
import { holdPlayerOrder } from "#/world/server/hold-player-order"
import { readPlayerDelivery } from "#/world/server/read-player-delivery"
import { receivePlayerGather } from "#/world/server/receive-player-gather"
import { receivePlayerShop } from "#/world/server/receive-player-shop"
import { receivePlayerCombat } from "#/world/server/receive-player-combat"
import { payPlayerStrike } from "#/world/server/pay-player-strike"
import { readPlayerInboxReceipt } from "#/world/server/read-player-inbox-receipt"
import { receivePlayerInbox } from "#/world/server/receive-player-inbox"
import { runPlayerCommand } from "#/world/server/run-player-command"
import { givePlayerItem } from "#/world/server/give-player-item"
import { resetPlayerRecord } from "#/world/server/reset-player-record"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { readPlayerRecord } from "#/world/server/read-player-record"
import { playerMigrations } from "#/world/server/player-record"
import type { PlayerArrivalInput, PlayerWalkInput, PlayerTravelInput } from "#/world/server/player-location-types"
import type { PlayerTradeInput, PlayerTradeDecision, PlayerStrikeInput } from "#/world/server/player-operation-types"
import type { GatherRequest } from "#/world/core/gather-receipt-types"
import type { ShopQuote } from "#/world/core/shop-receipt-types"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import type { Context } from "#/world/core/apply"
import type { Command, ServerCommand } from "#/world/core/commands"
import type { Transition } from "#/world/core/transition"
import type { PlayerState } from "#/world/core/player-types"
import type { TradeProposal, TradeRecord } from "#/world/core/trade-transaction-types"
import type { TradeJob } from "#/world/server/trade-coordinator"
import type { OrderIntent } from "#/world/core/exchange-types"
import type { ItemId } from "#/world/core/items/catalog"

/** One player per durable instance; each operation publishes its state and receipts in one save (game-system.md §13). */
export const Player = defineDurableState({
  initialState: initialPlayerRecord,
  version: 8,
  migrations: playerMigrations,
  methods: {
    arrive(context, input: PlayerArrivalInput) {
      return arrivePlayer(context.state, input, Date.now())
    },
    ownsConnection(context, connection: string): boolean {
      return context.state.location?.connection === connection
    },
    walk(context, input: PlayerWalkInput): boolean {
      return walkPlayer(context.state, input, Date.now())
    },
    travel(context, input: PlayerTravelInput): boolean {
      return travelPlayer(context.state, input, Date.now())
    },
    reviveAtHome(context, connection: string): Transition {
      return revivePlayerAtHome(context.state, connection, Date.now())
    },
    leave(context, connection: string) {
      leavePlayer(context.state, connection, Date.now())
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
    async beginTrade(context, input: PlayerTradeInput) {
      return beginPlayerTrade(context, input, Date.now())
    },
    tradeJob(context): TradeJob | null {
      return context.state.tradeJob
    },
    async advanceTrade(context): Promise<TradeJob | null> {
      await advancePlayerTrade(context, (id) => Player.get(id), Date.now())
      return context.state.tradeJob
    },
    tradeStatus(context): TradeRecord | null {
      return context.state.trade
    },
    prepareTrade(context, proposal: TradeProposal): ReturnType<typeof preparePlayerTrade> {
      return preparePlayerTrade(context.state, proposal, Date.now())
    },
    finishTrade(context, input: PlayerTradeDecision): Transition {
      return finishPlayerTrade(context.state, input)
    },
    holdOrder(context, id: number, intent: OrderIntent): Transition & { by?: string } {
      return holdPlayerOrder(context.state, { id, intent }, Date.now())
    },
    readCombat(context) {
      return { player: readPlayerRecord(context.state, Date.now()), life: context.state.combatLife }
    },
    deliveryUpdate(context, after: number | null) {
      return readPlayerDelivery(context.state, after)
    },
    receiveGather(context, source: string, request: GatherRequest): Transition {
      return receivePlayerGather({ record: context.state, source, request, now: Date.now() })
    },
    receiveShop(context, source: string, quote: ShopQuote): Transition {
      return receivePlayerShop({ record: context.state, source, quote, now: Date.now() })
    },
    receiveCombat(context, source: string, delivery: CombatDelivery): Transition {
      return receivePlayerCombat({ record: context.state, source, delivery, now: Date.now() })
    },
    payStrike(context, input: PlayerStrikeInput): Transition {
      return payPlayerStrike(context.state, input, Date.now())
    },
    inboxReceipt(context, id: number): Transition | null {
      return readPlayerInboxReceipt(context.state, id)
    },
    receiveInbox(context, claim: InboxClaim): Transition {
      return receivePlayerInbox(context.state, claim, Date.now())
    },
    /** The room supplies shop context; the player's operation uses the server timestamp. */
    run(context, command: Command | ServerCommand, ctx: Omit<Context, "now"> = {}): Transition {
      return runPlayerCommand(context.state, { command, context: ctx }, Date.now())
    },
    /** Dev-only bag changes. */
    give(context, item: ItemId, count: number): PlayerState {
      return givePlayerItem(context.state, { item, count })
    },
    /** Dev-only reset. */
    reset(context): PlayerState {
      return resetPlayerRecord(context.state)
    },
  },
  async alarm(context) {
    await advancePlayerTrade(context, (id) => Player.get(id), Date.now())
  },
})

export default Player
