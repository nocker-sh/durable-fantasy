// What the game shows, as one value the UI reads (hooks/use-game-state.ts): the map, the player, the open
// windows and conversations. Game (game.ts) is the only writer.
import type { ExchangeView, PartyView, TradeSideView } from "#/world/protocol"
import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"
import type { ShopId } from "#/world/core/shop-types"
import type { Derived } from "#/world/core/stats-types"
import type { MapId } from "#/world/maps/types"
import type { ResidentInfo, WalkerInfo } from "#/world/scene/runtime/types"

/** Windows the player opens and closes (ui.md §3). */
export type WindowId = "minimap" | "chat" | "syslog" | "inventory" | "equipment" | "stats" | "worldmap" | "errands" | "skills" | "friends"

/** Windows open at first, and after the layout is reset. */
export const DEFAULT_WINDOWS: readonly WindowId[] = ["minimap", "chat", "syslog"]
/** Windows Esc leaves alone: they stay open while playing. */
export const KEPT_ON_ESC: readonly WindowId[] = ["minimap", "chat", "syslog"]
/** Modal screens that sit over everything (ui.md §3.14). */
export type ModalId = "system" | "character" | "help" | "channel" | "welcome"
export type ChatChannel = "player" | "npc" | "system" | "party"

export type ChatLine = {
  id: number
  channel: ChatChannel
  name?: string
  text: string
  /** said by this player */
  self?: boolean
  shout?: boolean
}

export type DialogueChoice = {
  label: string
  action: "shop" | "commission" | "storage" | "close" | "errand-ask" | "errand-take" | "errand-hand"
  /** the errand a choice is about (core/errands.ts) */
  errand?: string
}

export type Dialogue = {
  resident: number
  name: string
  job: string
  pages: readonly string[]
  page: number
  /** offered on the last page */
  choices: readonly DialogueChoice[]
  /** when the current page started typing out (performance.now()); 0 once it is all shown */
  shownAt: number
}

/** Characters per second a conversation types out at. */
export const TEXT_SPEED = 36

export type Notice = {
  id: number
  text: string
  tone: "info" | "good" | "bad"
}

/** An NPC as the minimap and the UI see it. */
export type Npc = ResidentInfo & {
  role: "shop" | "other"
}

export type GameState = {
  /** the loading screen: which map and how far along, or null once playing */
  loading: { map: string; text: string } | null
  /** the map could not be drawn (the scene failed to build) */
  failed: boolean
  failureMessage?: string
  departed?: boolean
  connectionReplaced?: boolean
  map: { id: MapId; name: string; warps: readonly (readonly [number, number])[] }
  me: { x: number; z: number; walking: boolean; heading: number }
  online: "connecting" | "online" | "offline"
  /** other players on the map, with live positions */
  players: readonly WalkerInfo[]
  npcs: readonly Npc[]
  chat: readonly ChatLine[]
  dialogue: Dialogue | null
  shop: ShopId | null
  /** the player's data as the server last confirmed it */
  player: PlayerState | null
  /** values that follow from it (max HP, ATK…), and how much is carried */
  derived: (Derived & { weight: number }) | null
  /** a command is on its way to the server */
  busy: boolean
  /** open windows, front-most last */
  windows: readonly WindowId[]
  /** bumped when the layout is reset, so windows forget where they were */
  layout: number
  modal: ModalId | null
  /** the chat line is open for typing */
  typing: boolean
  zoom: { level: number; max: number }
  /** pictures of the look presets (index into LOOKS), filled in as they are drawn */
  portraits: Readonly<Record<number, string>>
  /** the player as they look now, neck wrap and all */
  portrait: string | null
  notices: readonly Notice[]
  /** dev builds: the debug panel is open */
  debug: boolean
  /** the time of day: minutes since midnight, Japan time, and whether it is held (?time=HH:MM) */
  clock: { min: number; held: boolean }
  /** what the open shop has now, as the server last said (the shelves are shared) */
  stock: { shop: ShopId; offers: readonly Offer[]; buys: Readonly<Record<string, number>> } | null
  /** the exchange board is open, and what it last showed (core/exchange.ts) */
  board: { symbol: string; view: ExchangeView | null } | null
  /** the craftsman whose commissions are open (core/commissions.ts) */
  commission: string | null
  /** the warehouse is open (core/storage/rules.ts) */
  storage: boolean
  /** another player picked by name: what can be done with them */
  playerMenu: { id: string; name: string } | null
  /** someone asking to trade with us */
  tradeAsk: { from: string; name: string } | null
  /** our party (core/party/), and someone asking us into theirs */
  party: PartyView | null
  partyAsk: { from: string; name: string } | null
  /** an open trade (core/check-trade.ts) */
  trade: { with: string; name: string; mine: TradeSideView; lots: { slot: number; count: number }[]; theirs: TradeSideView } | null
  /** the station whose recipes are open (core/station-of.ts) */
  craft: string | null
  /** how much each gathering spot on this map has left, as the server last said */
  nodes: Readonly<Record<string, number>>
  /** which parallel town and channel we are in, and how full the map's channels are (channels.ts) */
  room: { world: number; channel: number; channels: Readonly<Record<number, number>> } | null
  /** our own town (the one our muffler pulls us back to) */
  homeTown: number
  /** someone asking to swap muffler threads */
  threadAsk: { from: string; name: string } | null
}

/** One line in a shop window: a thing, its quality, its price now, how many are left (null: plenty), the next batch (ms). */
export type Offer = {
  item: ItemId
  q: Quality
  price: number
  left: number | null
  next: number | null
}
