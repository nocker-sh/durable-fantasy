import type { Rect } from "#/world/town/floorplan/types"

/** Interior area in the map frame's local metres; wall and shared doorway cells are separate. No ceiling is inferred. */
export type MapRoomSpace = Readonly<{ id: string; footprint: readonly Readonly<Rect>[] }>
