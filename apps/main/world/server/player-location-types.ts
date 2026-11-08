import type { Cell } from "#/world/protocol"
import type { PlayerRecord } from "#/world/server/player-record"
import type { Reason } from "#/world/core/commands"

export type PlayerArrivalInput = Readonly<{ world: number; map: string; connection: string }>
/** Where the player was let in, or (refused) where they still are; `world` is set when they stay in another world. */
export type PlayerArrival = Readonly<{ map: string; at: Cell; accepted: boolean; world?: number }>
export type PlayerWalkInput = Readonly<{ connection: string; route: Cell[]; since?: number }>
export type PlayerTravelInput = Readonly<{ connection: string; map: string; at: Cell }>
/** A way out: where to, and the stamina the road takes (0 within town). */
export type PlayerJourneyInput = PlayerTravelInput & Readonly<{ tire: number }>
export type PlayerJourney = Readonly<{ ok: true } | { ok: false; reason?: Reason }>
export type PlayerMovementRecord = Pick<PlayerRecord, "location" | "player">
export type PlayerRevivalRecord = Pick<PlayerRecord, "location" | "player" | "trade" | "combatLife" | "deliveryRevision">
