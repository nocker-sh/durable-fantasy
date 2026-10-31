import type { SpatialFrameChain } from "#/lib/engine/spatial-frame-chain"
import type { MapRoomSpace } from "#/world/maps/room-space-types"
import type { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { Rect } from "#/world/town/floorplan/types"

/** Frame coordinates are metres; the planar origin and scale describe the existing two-dimensional map units. */
export type MapSpace = Readonly<{
  /** Known room interiors in local metres; absence means room geometry is unverified. */
  rooms?: readonly MapRoomSpace[]
  parentMap: string
  frame: ConstructorParameters<typeof SpatialFrame>[0]
  planarOrigin: readonly [number, number]
  metresPerPlanarUnit: number
}>

/** Bounds are an explicitly known local horizontal domain, not a ceiling or an inferred region. */
export type MapSpaceEntry = Readonly<{ id: string; space?: MapSpace; bounds?: Readonly<Rect> }>

/** Map references and explicit non-playable spatial roots, independent of rendering or movement fields. */
export type MapSpaceRegistry = Readonly<Record<string, MapSpaceEntry>>

/** A query transform to a named spatial root, which need not be a playable map. */
export type MapSpaceTransform = Readonly<{ rootSpace: string; transform: SpatialFrameChain }>
