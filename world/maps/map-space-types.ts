import type { MapRoomSpace } from "#/world/maps/room-space-types"
import type { SpatialFrame } from "#/lib/engine/spatial-frame"

/** Frame coordinates are metres; the planar origin and scale describe the existing two-dimensional map units. */
export type MapSpace = Readonly<{
  /** Known room interiors in local metres; absence means room geometry is unverified. */
  rooms?: readonly MapRoomSpace[]
  parentMap: string
  frame: ConstructorParameters<typeof SpatialFrame>[0]
  planarOrigin: readonly [number, number]
  metresPerPlanarUnit: number
}>

/** Map identity and known placement used by spatial registration, independent of rendering or movement fields. */
export type MapSpaceRegistry = Readonly<Record<string, Readonly<{ id: string; space?: MapSpace }>>>
