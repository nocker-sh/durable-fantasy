import { walkable } from "#/world/maps/walkable"
import type { Cell, MapDefinition } from "#/world/maps/types"

const directions: readonly Cell[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

/** Search exact walkable cells, stopping once every requested target is reached; never snap endpoints. */
export function areMapCellsConnected(map: Pick<MapDefinition, "size" | "rows">, from: Cell, targets: readonly Cell[]): boolean {
  if (!walkable(map, from) || targets.some((cell) => !walkable(map, cell))) return false
  const pending = new Set(targets.map((cell) => cell.join(","))),
    seen = new Set([from.join(",")]),
    queue: Cell[] = [from]
  for (const current of queue) {
    pending.delete(current.join(","))
    if (!pending.size) return true
    for (const direction of directions) {
      const next: Cell = [current[0] + direction[0], current[1] + direction[1]],
        key = next.join(",")
      if (!seen.has(key) && walkable(map, next)) {
        seen.add(key)
        queue.push(next)
      }
    }
  }
  return false
}
