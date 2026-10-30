import type { ShelfSpec } from "#/world/town/shelf"
import { shelfParts } from "#/world/town/shelf-parts"

export function shelfBays(width: number, depth: number, shelf: ShelfSpec) {
  shelfParts({ x: 0, z: 0, width: width, depth: depth, floor: 0, shelf: shelf })
  const side = shelf.front === "e" || shelf.front === "w"
  return shelf.levels
    .slice(0, -1)
    .map((floor, i) => ({ width: (side ? depth : width) - 2 * shelf.board, depth: (side ? width : depth) - shelf.board, height: shelf.levels[i + 1] - shelf.board - floor }))
}
