import type { Rect } from "#/world/town/floorplan/types"

/** Measured slab below the finished floor, with stair and flue holes preserved in its disjoint footprint. */
export type MapFloorSpace = Readonly<{ thicknessMetres: number; footprint: readonly Readonly<Rect>[] }>

/** One solid floor strip in the named root; both faces are absolute metric elevations. */
export type MapFloorVolume = Readonly<{ mapId: string; rootSpace: string; undersideElevationMetres: number; floorElevationMetres: number; bounds: Readonly<Rect> }>
