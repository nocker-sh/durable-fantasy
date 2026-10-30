import type { PRoom, Placed } from "#/world/town/floorplan/types"

export type AuthoredCoveredCell = Readonly<{ tile: string; boundary: boolean }>
export type AuthoredProjectionRow = Readonly<{ cells: Map<number, AuthoredCoveredCell>; walls: Set<number> }>
export type AuthoredProjectedRow = Readonly<{ cells: ReadonlyMap<number, AuthoredCoveredCell>; walls: ReadonlySet<number> }>
export type AuthoredCoverage = Map<number, Map<number, AuthoredProjectionRow>>
export type AuthoredProjectedFloors = ReadonlyMap<number, ReadonlyMap<number, AuthoredProjectedRow>>
export type AuthoredRoomProjection = Readonly<{ rooms: readonly PRoom[]; pieces: readonly Placed[]; floors: AuthoredProjectedFloors; coveredCount: number }>
