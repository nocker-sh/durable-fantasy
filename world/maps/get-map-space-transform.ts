import { SpatialFrameChain } from "#/lib/engine/spatial-frame-chain"
import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import type { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { MapSpaceRegistry, MapSpaceTransform } from "#/world/maps/map-space-types"

/** Compose metric frames only; intermediate display origins and scales never enter a physical transform. */
export function getMapSpaceTransform(maps: MapSpaceRegistry, mapId: string): MapSpaceTransform {
  const frames: SpatialFrame[] = [],
    seen = new Set<string>()
  for (const cursor = { id: mapId }; ;) {
    const map = Object.hasOwn(maps, cursor.id) ? maps[cursor.id] : undefined
    if (!map || map.id !== cursor.id) throw new Error(`Map space parent is missing or miskeyed: ${cursor.id}`)
    if (seen.has(cursor.id)) throw new Error(`Map space parent cycle: ${cursor.id}`)
    seen.add(cursor.id)
    if (!map.space) return { rootSpace: cursor.id, transform: new SpatialFrameChain({ frames }) }
    try {
      frames.push(getMapSpaceFrame(map.space))
    } catch (error) {
      if (error instanceof RangeError) throw new Error(`Map space frame is invalid: ${cursor.id}`, { cause: error })
      throw error
    }
    cursor.id = map.space.parentMap
  }
}
