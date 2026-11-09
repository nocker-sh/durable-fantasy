import type { SeatFacing } from "#/world/town/seat-orientation"

export function seatHeading(facing: SeatFacing): number {
  return facing === "n" ? Math.PI : facing === "s" ? 0 : facing === "e" ? Math.PI / 2 : -Math.PI / 2
}
