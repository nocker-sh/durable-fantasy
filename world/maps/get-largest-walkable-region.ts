import { assertMapWalkGrid } from "#/world/maps/assert-map-walk-grid"
import { getWalkableRegion } from "#/world/maps/get-walkable-region"
import type { MapDefinition } from "#/world/maps/types"

/** Scan in row order and keep the first largest component; results belong to this grid, never an id-only cache. */
export function getLargestWalkableRegion(map: Pick<MapDefinition, "id" | "size" | "rows">): ReadonlySet<number> {
  const size = map.size
  assertMapWalkGrid(map)
  const seen = new Uint8Array(size * size),
    result: { best: ReadonlySet<number> } = { best: new Set<number>() }
  for (const cursor = { key: 0 }; cursor.key < size * size; cursor.key++) {
    if (seen[cursor.key] || map.rows[Math.floor(cursor.key / size)][cursor.key % size] !== ".") continue
    const part = getWalkableRegion(map, cursor.key, seen)
    if (part.size > result.best.size) result.best = part
  }
  return result.best
}
