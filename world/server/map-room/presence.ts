import type { Offer } from "#/world/core/trade-types"
import type { Stack } from "#/world/core/bag-types"
import type { WebSocketConnection } from "void/ws"
import type { Cell, MapPlayer, ServerMessage } from "#/world/protocol"

/** The town whose shelves these are (one per town; parallel towns will each have their own). */
export const TOWN = "phanthiet"

export type Presence = {
  joining?: boolean
  closed?: boolean
  ready?: boolean
  player: MapPlayer | null
  /** the player's id, for their Player Durable Object */
  owner: string | null
  /** the path being walked (or the cell stood on) and when it started */
  route: Cell[]
  since: number
  /** recent chat times, for the rate limit */
  said: number[]
  /** the NPC being talked to (or shopped with); the player cannot move meanwhile */
  engaged: string | null
  /** dev builds: the time of day this player's clock is held at */
  held?: number | null
  /** when they last struck a blow (ms) */
  struck?: number
  /** Last attempts to refresh authoritative resource and creature state. */
  natureCheckedAt?: number
  wildCheckedAt?: number
  /** Last check and observed revision of asynchronously saved player effects. */
  deliveryCheckedAt?: number
  deliveryRevision?: number
  /** fallen (0 HP): they cannot move until they come to in town */
  down?: boolean
  /** a face-to-face trade (core/check-trade.ts): asked of someone, or open with them */
  trade?: TradeSide
  /** sitting down to rest (core/skills.ts): walking or fighting gets them up */
  sitting?: boolean
  /** the party they are in (core/party.ts), and whom they have asked to join it */
  party?: string | null
  inviting?: string
  /** whom they have asked to swap muffler threads with (core/threads.ts) */
  threading?: string
}

export type TradeSide = {
  /** Shared identity of this accepted invitation, distinct from a later trade with the same person. */
  session?: string
  /** Latest offer request; older inventory reads must not overwrite it. */
  offerVersion?: number
  /** the other player's connection */
  with: string
  /** both have agreed to trade (until then it is only asked) */
  open: boolean
  offer: Offer
  /** what the offer is, as the other side sees it */
  shown: Stack[]
  /** settled ("決定"): the offer cannot change */
  locked: boolean
  /** pressed "exchange" */
  done: boolean
  /** Both confirmed; a durable settlement is being started or delivered. */
  settling?: boolean
}

export const presence = (connection: Pick<WebSocketConnection<ServerMessage>, "state">): Presence =>
  (connection.state as Presence | undefined) ?? { player: null, owner: null, route: [], since: 0, said: [], engaged: null }
