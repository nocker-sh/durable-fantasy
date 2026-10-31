import type { Rect } from "#/world/town/floorplan/types"

/** Interior area in the map frame's local metres; wall and shared doorway cells are separate. No ceiling is inferred. */
export type MapRoomSpace = Readonly<{ id: string; footprint: readonly Readonly<Rect>[] }>

/** One room strip projected into its named root, with the exact finished-floor elevation in metres. */
export type MapRoomFootprint = Readonly<{ mapId: string; roomId: string; rootMap: string; elevationMetres: number; bounds: Readonly<Rect> }>
