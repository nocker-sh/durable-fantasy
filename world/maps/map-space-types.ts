import type { SpatialFrame } from "#/lib/engine/spatial-frame"

/** Frame coordinates are metres; the planar origin and scale describe the existing two-dimensional map units. */
export type MapSpace = Readonly<{
  parentMap: string
  frame: ConstructorParameters<typeof SpatialFrame>[0]
  planarOrigin: readonly [number, number]
  metresPerPlanarUnit: number
}>
