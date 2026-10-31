import type { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { WindowFixture } from "#/world/town/room-fixtures"

export type EnvelopeWindowSource = Readonly<{
  window: WindowFixture
  frame: SpatialFrame
  floorLevels: readonly { floor: number; elevation: number }[]
  widthMetres: number
  depthMetres: number
  wallMetres: number
  metresPerTile: number
}>
