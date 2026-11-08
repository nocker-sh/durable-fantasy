import { walkable } from "#/world/maps/walkable"
import type { Cell, MapDefinition } from "#/world/maps/types"

const directions: readonly Cell[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/** Explore one component on the caller's visitation grid, preserving the original depth-first order. */
export function getWalkableRegion(map: Pick<MapDefinition, "size" | "rows">, at: number, seen: Uint8Array): ReadonlySet<number> {
  if (seen.length !== map.size * map.size) throw new Error("Invalid walk region visitation grid")
  const part = new Set<number>()
  if (!Number.isSafeInteger(at) || seen[at] || !walkable(map, [at % map.size, Math.floor(at / map.size)])) return part
  const pending = [at]
  seen[at] = 1
  part.add(at)
  while (pending.length) {
    const cell = pending.pop()
    if (cell === undefined) break
    const x = cell % map.size,
      z = Math.floor(cell / map.size)
    for (const direction of directions) {
      const column = x + direction[0],
        row = z + direction[1],
        key = row * map.size + column
      if (column < 0 || row < 0 || column >= map.size || row >= map.size || seen[key] || map.rows[row]?.[column] !== ".") continue
      seen[key] = 1
      part.add(key)
      pending.push(key)
    }
  }
  return part
}
