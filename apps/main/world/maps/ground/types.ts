import type { Polyline } from "#/lib/engine/polyline"

export type RoadPath = { path: Polyline; width: number; kind: number }

/** Coordinates and heights use the map's existing display units, before conversion to metres. */
export type WalkSurface = Readonly<{ rect: readonly [number, number, number, number]; height: number }>
export type HeightSampler = (x: number, z: number) => number

/** Snapshot of one map's display surface heights and presentation floor reference. */
export type MapWalkSampler = Readonly<{ mapId: string; displayFloorHeight: number; sample: HeightSampler }>

/** Ground samples shared by generation, rendering, workers and persisted caches. */
export type Fields = {
  h: Float32Array
  river: Float32Array
  /** Signed distance minus half width, minimized over roads. */
  road: Float32Array
  roadKind: Uint8Array
  trail?: Float32Array
  plazaH: number
}
