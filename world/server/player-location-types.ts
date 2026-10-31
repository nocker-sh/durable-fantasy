import type { Cell } from "#/world/protocol"
import type { PlayerRecord } from "#/world/server/player-record"

export type PlayerArrivalInput = Readonly<{ world: number; map: string; connection: string }>
export type PlayerWalkInput = Readonly<{ connection: string; route: Cell[]; since?: number }>
export type PlayerTravelInput = Readonly<{ connection: string; map: string; at: Cell }>
export type PlayerMovementRecord = Pick<PlayerRecord, "location" | "player">
export type PlayerRevivalRecord = Pick<PlayerRecord, "location" | "player" | "trade" | "combatLife" | "deliveryRevision">
