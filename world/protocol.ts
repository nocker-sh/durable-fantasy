// Messages between the browser and a map room (routes/map/[mapId].ws.ts). Positions are walk grid
// cells: cell (i, j) is centred at ((i + .5) / 2, (j + .5) / 2) in world units.
import { MAX_ORDER_PRICE, MAX_ORDER_QTY } from "#/world/core/exchange-rules"

import type { Candle, Inbox, Order } from "#/world/core/exchange-types"

/** What the board shows: the best bids and asks, daily prices, your orders and your inbox, the sellers. */
export type ExchangeView = {
  book: { bids: { price: number; qty: number }[]; asks: { price: number; qty: number }[] }
  history: Candle[]
  mine: Order[]
  inbox: Inbox
  last: Order[]
}
import { z } from "zod"
import { commissionOrderSchema } from "#/world/core/commission-order-schema"
import { MAX_ORDERS } from "#/world/core/commission-rules"
import type { Transition } from "#/world/core/transition"
import { commandSchema } from "./core/commands"
import { playerId } from "./core/identity"
import { isItemId } from "#/world/core/items/is-item-id"
import type { ItemId } from "#/world/core/items/catalog"
import { stackSchema } from "#/world/core/player-schema"
import type { PlayerState } from "#/world/core/player-types"
import type { Stack } from "#/world/core/bag-types"
import { SKILL_IDS } from "#/world/core/skill-ids"

/** A party as its members see it. */
export type PartyView = {
  mode: "own" | "even"
  /** we lead it */
  leading: boolean
  members: { name: string; level: number; hp: number; maxHp: number; map: string; leader: boolean; me: boolean; away: boolean }[]
}

/** One side of a trade as shown: the lots, the gold, settled, pressed exchange. */
export type TradeSideView = {
  stacks: Stack[]
  gold: number
  locked: boolean
  done: boolean
}

/** Largest walk grid any map has. */
export const GRID = 96

/** Longest path a move may carry. */
export const MAX_PATH = 160

/** How far ordinary speech carries, in cells. */
export const HEARING_CELLS = 20

/** Cells walked per second (2.4 tiles). */
export const CELLS_PER_SECOND = 4.8

const coordinate = z
  .number()
  .int()
  .min(0)
  .max(GRID - 1)
export const cellSchema = z.tuple([coordinate, coordinate])
export type Cell = z.infer<typeof cellSchema>

/** Someone else on the map, as everyone sees them. */
export type MapPlayer = {
  id: string
  name: string
  /** index into the look presets */
  look: number
  /** the neck wrap and its colour */
  neck: string
  neckRamp: string
  neckStripe?: string
  /** what they hold in hand */
  weapon: ItemId | null
  /** where they stand, or where they are walking to */
  at: Cell
}

const mapPlayer = z.object({
  id: z.string(),
  name: z.string(),
  look: z.number(),
  neck: z.string(),
  neckRamp: z.string(),
  neckStripe: z.string().optional(),
  weapon: z.custom<ItemId>((x) => typeof x === "string" && isItemId(x)).nullable(),
  at: cellSchema,
})

const partyChatCursor = z.object({ party: z.string().max(64), seq: z.number().int().nonnegative() })

export const clientMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heartbeat") }),
  /** Enter as the authenticated owner. `at` is a client prediction; the server chooses the position. */
  /** `time`: dev builds hold the clock at a time of day (?time=HH:MM); the server honours it only in dev */
  z.object({
    type: z.literal("join"),
    player: playerId,
    at: cellSchema,
    time: z.number().int().min(0).max(1439).optional(),
    /** following a party member or friend in: allowed a little over the cap */ following: z.boolean().optional(),
  }),
  /** Walk along these cells, one step apart, starting on or next to the current path. */
  z.object({ type: z.literal("move"), path: z.array(cellSchema).min(1).max(MAX_PATH) }),
  /** Speak to players nearby, or shout to the whole map. */
  z.object({ type: z.literal("say"), text: z.string().trim().min(1).max(140), shout: z.boolean().optional() }),
  /** Run a command on the player's data; the answer comes back as `result` with the same seq. */
  z.object({ type: z.literal("command"), seq: z.number().int(), command: commandSchema }),
  /** Start talking to an NPC (by name), or stop with null. While talking the player cannot move. */
  z.object({ type: z.literal("engage"), npc: z.string().max(32).nullable() }),
  /** Have a go at a gathering spot (core/gather.ts); answered like a command. */
  z.object({ type: z.literal("gather"), seq: z.number(), node: z.string().max(60) }),
  /** Make something at a station (core/station-of.ts); answered like a command. */
  z.object({ type: z.literal("craft"), seq: z.number(), station: z.string().max(40), recipe: z.string().max(40) }),
  /** Leave work with a craftsman, or collect it (core/commissions.ts); answered like commands. */
  z.object({ type: z.literal("order"), seq: z.number(), commission: z.string().max(40) }),
  /** A resident's errand (core/errands.ts): take it from them, or hand it over to them; we stand beside them. */
  z.object({ type: z.literal("errand"), seq: z.number(), action: z.enum(["take", "hand"]), errand: z.string().max(40), resident: z.string().max(20) }),
  z.object({
    type: z.literal("collect"),
    seq: z.number(),
    index: z
      .number()
      .int()
      .min(0)
      .max(MAX_ORDERS - 1),
    orders: z.array(commissionOrderSchema).max(MAX_ORDERS),
  }),
  /** The exchange board (core/exchange.ts): look at a symbol, put up or take down an order, collect the inbox. */
  z.object({ type: z.literal("ex-look"), symbol: z.string().max(48) }),
  z.object({
    type: z.literal("ex-place"),
    seq: z.number(),
    side: z.enum(["buy", "sell"]),
    symbol: z.string().max(48),
    price: z.number().int().min(1).max(MAX_ORDER_PRICE),
    qty: z.number().int().min(1).max(MAX_ORDER_QTY),
    market: z.boolean().optional(),
    slot: z.number().int().min(0).max(23).optional(),
  }),
  z.object({ type: z.literal("ex-cancel"), seq: z.number(), id: z.string().max(16) }),
  z.object({ type: z.literal("ex-claim"), seq: z.number() }),
  /** Strike a creature (core/monsters.ts); the room checks reach and the time between blows. */
  /** With an art (core/skills.ts), the blow is the art's: the room has the player pay its SP first. */
  z.object({ type: z.literal("attack"), monster: z.string().max(48), art: z.enum(SKILL_IDS).optional() }),
  /** The town warehouse (core/storage/rules.ts): leave a lot from a bag slot, or take one back; we stand by Hilde. */
  z.object({
    type: z.literal("storage"),
    stack: stackSchema.nullable(),
    seq: z.number(),
    action: z.enum(["store", "retrieve"]),
    index: z.number().int().min(0).max(99),
    count: z.number().int().min(1).max(99),
  }),
  /** Face-to-face trades (core/check-trade.ts): ask someone, answer, put up lots and gold, settle, exchange, call it off. */
  z.object({ type: z.literal("trade-ask"), target: z.string().max(64) }),
  z.object({ type: z.literal("trade-answer"), from: z.string().max(64), yes: z.boolean() }),
  z.object({
    type: z.literal("trade-offer"),
    lots: z.array(z.object({ slot: z.number().int().min(0).max(23), count: z.number().int().min(1).max(99) })).max(8),
    gold: z.number().int().min(0).max(10_000_000),
  }),
  z.object({ type: z.literal("trade-lock") }),
  z.object({ type: z.literal("trade-go") }),
  z.object({ type: z.literal("trade-cancel") }),
  /** Swap muffler threads with someone standing by (core/threads.ts): ask, answer. */
  z.object({ type: z.literal("thread-ask"), target: z.string().max(64) }),
  z.object({ type: z.literal("thread-answer"), from: z.string().max(64), yes: z.boolean() }),
  /** Parties (core/party.ts): ask someone on the map to join, answer, leave, choose how experience is shared, look. */
  z.object({ type: z.literal("party-invite"), target: z.string().max(64) }),
  z.object({ type: z.literal("party-answer"), from: z.string().max(64), yes: z.boolean() }),
  z.object({ type: z.literal("party-leave") }),
  z.object({ type: z.literal("party-mode"), mode: z.enum(["own", "even"]) }),
  z.object({ type: z.literal("party-look"), chat: partyChatCursor.optional() }),
  z.object({ type: z.literal("party-say"), text: z.string().trim().min(1).max(140), chat: partyChatCursor.optional() }),
  /** Fallen, come to in town (game-system.md §8). */
  z.object({ type: z.literal("revive") }),
  /** Ask what a shop has now (the shelves are shared: market Durable Object). */
  z.object({ type: z.literal("look"), shop: z.string().max(32) }),
  /** Take the warp at index `warp` of this map. */
  z.object({ type: z.literal("warp"), warp: z.number().int().min(0) }),
])
export type ClientMessage = z.infer<typeof clientMessage>

export const serverMessage = z.discriminatedUnion("type", [
  /** Sent when a player joins: their connection id, their data and everyone else on the map. */
  z.object({ type: z.literal("snapshot"), you: z.string(), me: z.custom<PlayerState>(() => true), players: z.array(mapPlayer), at: cellSchema.optional() }),
  /** Someone entered the map or changed their name, looks or weapon. */
  z.object({ type: z.literal("joined"), player: mapPlayer }),
  z.object({ type: z.literal("left"), id: z.string() }),
  z.object({ type: z.literal("moved"), id: z.string(), path: z.array(cellSchema) }),
  z.object({ type: z.literal("said"), id: z.string(), text: z.string(), shout: z.boolean() }),
  z.object({ type: z.literal("result"), seq: z.number(), result: z.custom<Transition>(() => true) }),
  /** The warp was allowed: leave this room and join `map` at `at`. */
  z.object({ type: z.literal("warped"), map: z.string(), at: cellSchema }),
  /** The exchange as this player sees it for one symbol. */
  z.object({ type: z.literal("exchange"), symbol: z.string(), view: z.custom<ExchangeView>(() => true) }),
  /** The creatures on this map: what each has left and when the beaten ones are back (on joining). */
  z.object({ type: z.literal("wild"), revision: z.number().int().min(0).optional(), monsters: z.record(z.string(), z.object({ hp: z.number(), back: z.number() })) }),
  /** A blow struck: by whom, at what, how it went, what the creature has left. */
  z.object({
    type: z.literal("struck"),
    revision: z.number().int().min(0).optional(),
    by: z.string(),
    monster: z.string(),
    swing: z.custom<{ kind: "miss" } | { kind: "hit" | "critical"; damage: number }>(() => true),
    hp: z.number(),
    back: z.number(),
  }),
  /** Someone asks to swap muffler threads; or it fell through (DECLINED, TOO_FAR). */
  z.object({ type: z.literal("thread-asked"), from: z.string(), name: z.string() }),
  z.object({ type: z.literal("thread-closed"), reason: z.string() }),
  /** Someone asks us into their party. */
  z.object({ type: z.literal("party-invited"), from: z.string(), name: z.string() }),
  /** Our party as it is now (null: in none). */
  z.object({ type: z.literal("party"), view: z.custom<PartyView | null>(() => true) }),
  /** Recent speech visible to this party member, with a cursor for polling. */
  z.object({
    type: z.literal("party-chat"),
    party: z.string(),
    seq: z.number().int().nonnegative(),
    lines: z.array(z.object({ seq: z.number().int().positive(), name: z.string(), text: z.string(), self: z.boolean() })),
  }),
  /** An invitation fell through: DECLINED, BUSY, NOT_LEADER, FULL. */
  z.object({ type: z.literal("party-closed"), reason: z.string() }),
  /** Someone asks to trade with us. */
  z.object({ type: z.literal("trade-asked"), from: z.string(), name: z.string() }),
  /** The trade table: what we put up (and from which slots), what they put up, who has settled and pressed exchange. */
  z.object({
    type: z.literal("trade-view"),
    with: z.string(),
    name: z.string(),
    mine: z.custom<TradeSideView>(() => true),
    lots: z.custom<{ slot: number; count: number }[]>(() => true),
    theirs: z.custom<TradeSideView>(() => true),
  }),
  /** The trade is over: DONE, or why not (a Reason, DECLINED, CANCELLED, LEFT, BUSY, TOO_FAR). */
  z.object({ type: z.literal("trade-closed"), reason: z.string() }),
  /** A struck creature strikes back at the one who struck it; `down`: that brought them down. */
  z.object({ type: z.literal("hitback"), monster: z.string(), target: z.string(), swing: z.custom<{ kind: "miss" } | { kind: "hit" | "critical"; damage: number }>(() => true), down: z.boolean() }),
  /** How much the gathering spots on this map have left (on joining, and whenever one changes). */
  z.object({ type: z.literal("nodes"), left: z.record(z.string(), z.number()) }),
  /** What a shop has now: each thing and quality, its price now and how many are left (null: plenty). */
  z.object({
    type: z.literal("stock"),
    shop: z.string(),
    offers: z.array(z.object({ item: z.string(), q: z.number(), price: z.number(), left: z.number().nullable(), next: z.number().nullable() })),
    /** what it pays now for what you carry */ buys: z.record(z.string(), z.number()).optional(),
  }),
  /** The server turned the last request down (a bad path, too far from a warp…). */
  z.object({ type: z.literal("refused"), what: z.string(), reason: z.string().optional(), monster: z.string().optional(), at: cellSchema.optional() }),
])
export type ServerMessage = z.infer<typeof serverMessage>
