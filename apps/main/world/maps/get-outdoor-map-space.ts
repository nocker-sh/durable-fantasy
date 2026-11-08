import { TILE_M } from "#/world/town/fit"
import { WR } from "#/world/maps/ground/rules"
import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import { WORLD_SPACE_ROOT } from "#/world/maps/world-space-rules"
import { assertWorldSquarePosition } from "#/world/maps/assert-world-square-position"
import type { MapSpace } from "#/world/maps/map-space-types"
import type { MapDefinition } from "#/world/maps/types"
import type { Square } from "#/world/maps/grid-types"

/** Grid edges are metric boundaries; zero height is a shared datum, not a terrain sample. */
export function getOutdoorMapSpace(map: Pick<MapDefinition, "id" | "size">, square: Square): MapSpace {
  assertWorldSquarePosition(square.at)
  if (square.city || square.map !== map.id || !Number.isSafeInteger(map.size) || map.size <= 0) throw new Error(`Invalid outdoor map space: ${map.id}`)
  const span = (map.size / WR) * TILE_M
  const space: MapSpace = {
    parentMap: WORLD_SPACE_ROOT,
    frame: { origin: [square.at[0] * span, 0, square.at[1] * span], width: span, depth: span, quarterTurns: 0 },
    planarOrigin: [0, 0],
    metresPerPlanarUnit: TILE_M,
  }
  getMapSpaceFrame(space)
  return space
}
