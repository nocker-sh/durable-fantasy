import type { DoorFittings } from "#/world/town/door-section"

/** Conservative moving envelope on both faces, including fitted hardware. */
export function doorMovingThickness(board: number, fittings?: DoorFittings): number {
  if (!Number.isFinite(board) || board <= 0) throw new Error("Door board thickness must be positive")
  if (!fittings) return board
  if (![fittings.brace_projection_m, fittings.handle_projection_m].every((n) => Number.isFinite(n) && n >= 0)) throw new Error("Door fitting projections must be finite and nonnegative")
  return board + 2 * Math.max(fittings.brace_projection_m, fittings.handle_projection_m)
}
