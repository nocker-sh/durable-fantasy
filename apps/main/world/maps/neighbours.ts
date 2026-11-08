import { isMapId } from "#/world/maps/is-map-id"
import type { MapDefinition, MapId } from "#/world/maps/types"

/** Maps one warp away, to load ahead of time. */
export function neighbours(map: MapDefinition): MapId[] {
  return [...new Set(map.warps.map((w) => w.to.map))].filter(isMapId)
}
