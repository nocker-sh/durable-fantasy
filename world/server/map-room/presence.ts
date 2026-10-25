// Who is where in a map room, kept on each connection, and helpers over it.
import type { Party as PartyState } from "../../core/party.ts"
import type { Offer } from "../../core/trade.ts"
import type { Stack } from "../../core/bag.ts"
import type { WebSocketConnection } from "void/ws"
import { jstMinutes } from "../../core/clock.ts"
import { wornNeck, type PlayerState } from "../../core/player.ts"
import { cellDistance } from "../../maps/index.ts"
import { cellsReached, type Cell, type MapPlayer, type PartyView, type ServerMessage } from "../../protocol.ts"

/** The town whose shelves these are (one per town; parallel towns will each have their own). */
export const TOWN = "phanthiet"

export interface Presence {
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
  /** fallen (0 HP): they cannot move until they come to in town */
  down?: boolean
  /** a face-to-face trade (core/trade.ts): asked of someone, or open with them */
  trade?: TradeSide
  /** sitting down to rest (core/skills.ts): walking or fighting gets them up */
  sitting?: boolean
  /** the party they are in (core/party.ts), and whom they have asked to join it */
  party?: string | null
  inviting?: string
  /** whom they have asked to swap muffler threads with (core/threads.ts) */
  threading?: string
}

export interface TradeSide {
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
}

/** The time of day for this player: Japan's, or in dev the time their clock is held at. */
export const timeFor = (me: Presence) => (import.meta.env.DEV && me.held != null ? me.held : jstMinutes(Date.now()))

export const presence = (connection: WebSocketConnection<ServerMessage>): Presence =>
  (connection.state as Presence | undefined) ?? { player: null, owner: null, route: [], since: 0, said: [], engaged: null }

export const setPresence = (connection: WebSocketConnection<ServerMessage>, patch: Partial<Presence>) => connection.setState({ ...presence(connection), ...patch } satisfies Presence)

/** A party as members see it: no one's player id leaves the server. */
export const partyView = (p: PartyState, me: string): PartyView => ({
  mode: p.mode,
  leading: p.leader === me,
  members: p.members.map((m) => ({ name: m.name, level: m.level, hp: m.hp, maxHp: m.maxHp, map: m.map, leader: m.owner === p.leader, me: m.owner === me, away: Date.now() - m.at > 30_000 })),
})

export const setTrade = (connection: WebSocketConnection<ServerMessage>, trade: TradeSide | undefined, patch: Partial<Presence> = {}) =>
  connection.setState({ ...presence(connection), ...patch, trade } satisfies Presence)

/** Show both sides of a trade what is on the table. */
export async function showTrade(a: WebSocketConnection<ServerMessage>, b: WebSocketConnection<ServerMessage>) {
  const pa = presence(a),
    pb = presence(b)
  if (!pa.trade || !pb.trade || !pa.player || !pb.player) return
  const side = (t: TradeSide) => ({ stacks: t.shown, gold: t.offer.gold, locked: t.locked, done: t.done })
  await a.send({ type: "trade-view", with: b.id, name: pb.player.name, mine: side(pa.trade), lots: [...pa.trade.offer.lots], theirs: side(pb.trade) })
  await b.send({ type: "trade-view", with: a.id, name: pa.player.name, mine: side(pb.trade), lots: [...pb.trade.offer.lots], theirs: side(pa.trade) })
}

export const mapPlayer = (id: string, data: PlayerState, at: Cell): MapPlayer => ({ id, name: data.name, look: data.look, ...wornNeck(data), weapon: data.equipment.weapon, at })

/** Where the player may be right now. */
export const reachable = (me: Presence) => cellsReached(me.route, (Date.now() - me.since) / 1000)

export const near = (me: Presence, target: Cell, cells: number) => reachable(me).some((c) => cellDistance(c, target) <= cells)
/**
 * At a way out: there now, or about to be. The screen walks a little ahead of the server's count
 * (the walk is sent as it starts), so arriving at the end of a long walk the server may still have
 * them a step or two short. A second's grace, along the route they are already on.
 */
export const atWarp = (me: Presence, at: Cell) => cellsReached(me.route, (Date.now() - me.since) / 1000 + 1).some((c) => cellDistance(c, at) <= 1)
