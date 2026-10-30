import { adjacentCells } from "#/world/adjacent-cells"
import type { Cell } from "#/world/protocol"

/** A turn starts near the previous route, keeps every step adjacent and checks every cell's terrain. */
export function validPath(previous: readonly Cell[], path: readonly Cell[], walkable: (cell: Cell) => boolean): boolean {
  if (!previous.some((cell) => adjacentCells(cell, path[0]))) return false
  for (const index of path.keys()) if (index > 0 && !adjacentCells(path[index - 1], path[index])) return false

  return path.every(walkable)
}
