// Messages between the browser and a map room (routes/map/[mapId].ws.ts). Positions are walk grid
// cells: cell (i, j) is centred at ((i + .5) / 2, (j + .5) / 2) in world units.
import type { Candle, Inbox, Order } from "./core/exchange.ts";

/** What the board shows: the best bids and asks, daily prices, your orders and your inbox, the sellers. */
export interface ExchangeView {
  book: { bids: { price: number; qty: number }[]; asks: { price: number; qty: number }[] };
  history: Candle[];
  mine: Order[];
  inbox: Inbox;
  last: Order[];
}
import * as v from "valibot";
import type { Transition } from "./core/apply.ts";
import { commandSchema } from "./core/commands.ts";
import { playerId } from "./core/identity.ts";
import { isItemId, type ItemId } from "./core/items.ts";
import type { PlayerState } from "./core/player.ts";
import type { Stack } from "./core/bag.ts";
import { SKILL_IDS } from "./core/skills.ts";

/** A party as its members see it. */
export interface PartyView {
  mode: "own" | "even";
  /** we lead it */
  leading: boolean;
  members: { name: string; level: number; hp: number; maxHp: number; map: string; leader: boolean; me: boolean; away: boolean }[];
}

/** One side of a trade as shown: the lots, the gold, settled, pressed exchange. */
export interface TradeSideView {
  stacks: Stack[];
  gold: number;
  locked: boolean;
  done: boolean;
}

/** Largest walk grid any map has. */
export const GRID = 96;

/** Longest path a move may carry. */
export const MAX_PATH = 160;

/** How far ordinary speech carries, in cells. */
export const HEARING_CELLS = 20;

/** Cells walked per second (2.4 tiles). */
export const CELLS_PER_SECOND = 4.8;

const coordinate = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(GRID - 1));
export const cellSchema = v.tuple([coordinate, coordinate]);
export type Cell = v.InferOutput<typeof cellSchema>;

/** Someone else on the map, as everyone sees them. */
export interface MapPlayer {
  id: string;
  name: string;
  /** index into the look presets */
  look: number;
  /** the neck wrap and its colour */
  neck: string;
  neckRamp: string;
  neckStripe?: string;
  /** what they hold in hand */
  weapon: ItemId | null;
  /** where they stand, or where they are walking to */
  at: Cell;
}

const mapPlayer = v.object({
  id: v.string(),
  name: v.string(),
  look: v.number(),
  neck: v.string(),
  neckRamp: v.string(),
  neckStripe: v.optional(v.string()),
  weapon: v.nullable(v.custom<ItemId>((x) => typeof x === "string" && isItemId(x))),
  at: cellSchema,
});

export const clientMessage = v.variant("type", [
  /** Enter the map as this player. `at` is where to appear if the server has no better place. */
  /** `time`: dev builds hold the clock at a time of day (?time=HH:MM); the server honours it only in dev */
  v.object({
    type: v.literal("join"),
    player: playerId,
    at: cellSchema,
    time: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(1439))),
    /** following a party member or friend in: allowed a little over the cap */ following: v.optional(v.boolean()),
  }),
  /** Walk along these cells, one step apart, starting on or next to the current path. */
  v.object({ type: v.literal("move"), path: v.pipe(v.array(cellSchema), v.minLength(1), v.maxLength(MAX_PATH)) }),
  /** Speak to players nearby, or shout to the whole map. */
  v.object({ type: v.literal("say"), text: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(140)), shout: v.optional(v.boolean()) }),
  /** Run a command on the player's data; the answer comes back as `result` with the same seq. */
  v.object({ type: v.literal("command"), seq: v.pipe(v.number(), v.integer()), command: commandSchema }),
  /** Start talking to an NPC (by name), or stop with null. While talking the player cannot move. */
  v.object({ type: v.literal("engage"), npc: v.nullable(v.pipe(v.string(), v.maxLength(32))) }),
  /** Have a go at a gathering spot (core/gather.ts); answered like a command. */
  v.object({ type: v.literal("gather"), seq: v.number(), node: v.pipe(v.string(), v.maxLength(60)) }),
  /** Make something at a station (core/crafting.ts); answered like a command. */
  v.object({ type: v.literal("craft"), seq: v.number(), station: v.pipe(v.string(), v.maxLength(40)), recipe: v.pipe(v.string(), v.maxLength(40)) }),
  /** Leave work with a craftsman, or collect it (core/commissions.ts); answered like commands. */
  v.object({ type: v.literal("order"), seq: v.number(), commission: v.pipe(v.string(), v.maxLength(40)) }),
  /** A resident's errand (core/errands.ts): take it from them, or hand it over to them; we stand beside them. */
  v.object({ type: v.literal("errand"), seq: v.number(), action: v.picklist(["take", "hand"]), errand: v.pipe(v.string(), v.maxLength(40)), resident: v.pipe(v.string(), v.maxLength(20)) }),
  v.object({ type: v.literal("collect"), seq: v.number(), index: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(9)) }),
  /** The exchange board (core/exchange.ts): look at a symbol, put up or take down an order, collect the inbox. */
  v.object({ type: v.literal("ex-look"), symbol: v.pipe(v.string(), v.maxLength(48)) }),
  v.object({
    type: v.literal("ex-place"),
    seq: v.number(),
    side: v.picklist(["buy", "sell"]),
    symbol: v.pipe(v.string(), v.maxLength(48)),
    price: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1_000_000)),
    qty: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(99)),
    market: v.optional(v.boolean()),
    slot: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(23))),
  }),
  v.object({ type: v.literal("ex-cancel"), seq: v.number(), id: v.pipe(v.string(), v.maxLength(16)) }),
  v.object({ type: v.literal("ex-claim"), seq: v.number() }),
  /** Strike a creature (core/monsters.ts); the room checks reach and the time between blows. */
  /** With an art (core/skills.ts), the blow is the art's: the room has the player pay its SP first. */
  v.object({ type: v.literal("attack"), monster: v.pipe(v.string(), v.maxLength(48)), art: v.optional(v.picklist(SKILL_IDS)) }),
  /** The town warehouse (core/storage.ts): leave a lot from a bag slot, or take one back; we stand by Hilde. */
  v.object({
    type: v.literal("storage"),
    seq: v.number(),
    action: v.picklist(["store", "retrieve"]),
    index: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(99)),
    count: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(99)),
  }),
  /** Face-to-face trades (core/trade.ts): ask someone, answer, put up lots and gold, settle, exchange, call it off. */
  v.object({ type: v.literal("trade-ask"), target: v.pipe(v.string(), v.maxLength(64)) }),
  v.object({ type: v.literal("trade-answer"), from: v.pipe(v.string(), v.maxLength(64)), yes: v.boolean() }),
  v.object({
    type: v.literal("trade-offer"),
    lots: v.pipe(v.array(v.object({ slot: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(23)), count: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(99)) })), v.maxLength(8)),
    gold: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(10_000_000)),
  }),
  v.object({ type: v.literal("trade-lock") }),
  v.object({ type: v.literal("trade-go") }),
  v.object({ type: v.literal("trade-cancel") }),
  /** Swap muffler threads with someone standing by (core/threads.ts): ask, answer. */
  v.object({ type: v.literal("thread-ask"), target: v.pipe(v.string(), v.maxLength(64)) }),
  v.object({ type: v.literal("thread-answer"), from: v.pipe(v.string(), v.maxLength(64)), yes: v.boolean() }),
  /** Parties (core/party.ts): ask someone on the map to join, answer, leave, choose how experience is shared, look. */
  v.object({ type: v.literal("party-invite"), target: v.pipe(v.string(), v.maxLength(64)) }),
  v.object({ type: v.literal("party-answer"), from: v.pipe(v.string(), v.maxLength(64)), yes: v.boolean() }),
  v.object({ type: v.literal("party-leave") }),
  v.object({ type: v.literal("party-mode"), mode: v.picklist(["own", "even"]) }),
  v.object({ type: v.literal("party-look") }),
  /** Fallen, come to in town (game-system.md §8). */
  v.object({ type: v.literal("revive") }),
  /** Ask what a shop has now (the shelves are shared: market Durable Object). */
  v.object({ type: v.literal("look"), shop: v.pipe(v.string(), v.maxLength(32)) }),
  /** Take the warp at index `warp` of this map. */
  v.object({ type: v.literal("warp"), warp: v.pipe(v.number(), v.integer(), v.minValue(0)) }),
]);
export type ClientMessage = v.InferOutput<typeof clientMessage>;

export const serverMessage = v.variant("type", [
  /** Sent when a player joins: their connection id, their data and everyone else on the map. */
  v.object({ type: v.literal("snapshot"), you: v.string(), me: v.custom<PlayerState>(() => true), players: v.array(mapPlayer) }),
  /** Someone entered the map or changed their name, looks or weapon. */
  v.object({ type: v.literal("joined"), player: mapPlayer }),
  v.object({ type: v.literal("left"), id: v.string() }),
  v.object({ type: v.literal("moved"), id: v.string(), path: v.array(cellSchema) }),
  v.object({ type: v.literal("said"), id: v.string(), text: v.string(), shout: v.boolean() }),
  v.object({ type: v.literal("result"), seq: v.number(), result: v.custom<Transition>(() => true) }),
  /** The warp was allowed: leave this room and join `map` at `at`. */
  v.object({ type: v.literal("warped"), map: v.string(), at: cellSchema }),
  /** The exchange as this player sees it for one symbol. */
  v.object({ type: v.literal("exchange"), symbol: v.string(), view: v.custom<ExchangeView>(() => true) }),
  /** The creatures on this map: what each has left and when the beaten ones are back (on joining). */
  v.object({ type: v.literal("wild"), monsters: v.record(v.string(), v.object({ hp: v.number(), back: v.number() })) }),
  /** A blow struck: by whom, at what, how it went, what the creature has left. */
  v.object({
    type: v.literal("struck"),
    by: v.string(),
    monster: v.string(),
    swing: v.custom<{ kind: "miss" } | { kind: "hit" | "critical"; damage: number }>(() => true),
    hp: v.number(),
    back: v.number(),
  }),
  /** Someone asks to swap muffler threads; or it fell through (DECLINED, TOO_FAR). */
  v.object({ type: v.literal("thread-asked"), from: v.string(), name: v.string() }),
  v.object({ type: v.literal("thread-closed"), reason: v.string() }),
  /** Someone asks us into their party. */
  v.object({ type: v.literal("party-invited"), from: v.string(), name: v.string() }),
  /** Our party as it is now (null: in none). */
  v.object({ type: v.literal("party"), view: v.custom<PartyView | null>(() => true) }),
  /** An invitation fell through: DECLINED, BUSY, NOT_LEADER, FULL. */
  v.object({ type: v.literal("party-closed"), reason: v.string() }),
  /** Someone asks to trade with us. */
  v.object({ type: v.literal("trade-asked"), from: v.string(), name: v.string() }),
  /** The trade table: what we put up (and from which slots), what they put up, who has settled and pressed exchange. */
  v.object({
    type: v.literal("trade-view"),
    with: v.string(),
    name: v.string(),
    mine: v.custom<TradeSideView>(() => true),
    lots: v.custom<{ slot: number; count: number }[]>(() => true),
    theirs: v.custom<TradeSideView>(() => true),
  }),
  /** The trade is over: DONE, or why not (a Reason, DECLINED, CANCELLED, LEFT, BUSY, TOO_FAR). */
  v.object({ type: v.literal("trade-closed"), reason: v.string() }),
  /** A struck creature strikes back at the one who struck it; `down`: that brought them down. */
  v.object({ type: v.literal("hitback"), monster: v.string(), target: v.string(), swing: v.custom<{ kind: "miss" } | { kind: "hit" | "critical"; damage: number }>(() => true), down: v.boolean() }),
  /** How much the gathering spots on this map have left (on joining, and whenever one changes). */
  v.object({ type: v.literal("nodes"), left: v.record(v.string(), v.number()) }),
  /** What a shop has now: each thing and quality, its price now and how many are left (null: plenty). */
  v.object({
    type: v.literal("stock"),
    shop: v.string(),
    offers: v.array(v.object({ item: v.string(), q: v.number(), price: v.number(), left: v.nullable(v.number()), next: v.nullable(v.number()) })),
    /** what it pays now for what you carry */ buys: v.optional(v.record(v.string(), v.number())),
  }),
  /** The server turned the last request down (a bad path, too far from a warp…). */
  v.object({ type: v.literal("refused"), what: v.string(), reason: v.optional(v.string()) }),
]);
export type ServerMessage = v.InferOutput<typeof serverMessage>;

const adjacent = (a: Cell, b: Cell) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) <= 1;

/**
 * A path is acceptable when it starts on, or next to, a cell of the previous path (the player may
 * change course halfway along it), every step moves one cell, and every cell is walkable.
 */
export function validPath(previous: readonly Cell[], path: readonly Cell[], walkable: (c: Cell) => boolean): boolean {
  if (!previous.some((cell) => adjacent(cell, path[0]))) return false;
  for (let i = 1; i < path.length; i++) if (!adjacent(path[i - 1], path[i])) return false;
  return path.every(walkable);
}

/**
 * Cells the player may be on now, `seconds` after starting along `path`: a straight step takes
 * 1 / CELLS_PER_SECOND and a diagonal one √2 times that, so the true cell lies in this window.
 */
export function cellsReached(path: readonly Cell[], seconds: number): readonly Cell[] {
  const fastest = Math.ceil(seconds * CELLS_PER_SECOND) + 1;
  const slowest = Math.floor((seconds * CELLS_PER_SECOND) / Math.SQRT2) - 1;
  return path.slice(Math.max(0, Math.min(path.length - 1, slowest)), Math.max(1, Math.min(path.length, fastest + 1)));
}
