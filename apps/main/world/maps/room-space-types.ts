import type { Rect } from "#/world/town/floorplan/types"

/** Interior area in the map frame's local metres; wall and shared doorway cells are separate. An optional height is explicitly measured from finished floor to ceiling. */
export type MapRoomSpace = Readonly<{ id: string; footprint: readonly Readonly<Rect>[]; heightMetres?: number }>

/** One room strip projected into its named root, with the exact finished-floor elevation in metres. */
export type MapRoomFootprint = Readonly<{ mapId: string; roomId: string; rootSpace: string; elevationMetres: number; bounds: Readonly<Rect> }>

/** One measured room strip extruded between its finished floor and ceiling in the named root. */
export type MapRoomVolume = MapRoomFootprint & Readonly<{ ceilingElevationMetres: number }>
