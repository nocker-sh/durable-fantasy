import { CELLS_PER_SECOND } from "#/world/protocol"
import type { Cell } from "#/world/protocol"

/** Bound the current cell between straight and diagonal travel speeds without advancing the saved route. */
export function cellsReached(path: readonly Cell[], seconds: number): readonly Cell[] {
  const fastest = Math.ceil(seconds * CELLS_PER_SECOND) + 1
  const slowest = Math.floor((seconds * CELLS_PER_SECOND) / Math.SQRT2) - 1

  return path.slice(Math.max(0, Math.min(path.length - 1, slowest)), Math.max(1, Math.min(path.length, fastest + 1)))
}
