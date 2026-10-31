import type { Polyline } from "#/lib/engine/polyline"

export type RoadPath = { path: Polyline; width: number; kind: number }

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
