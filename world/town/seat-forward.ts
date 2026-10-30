import type { SeatFacing } from "#/world/town/seat-orientation"

export function seatForward(facing: SeatFacing): readonly [number, number] {
  return facing === "n" ? [0, -1] : facing === "s" ? [0, 1] : facing === "w" ? [-1, 0] : [1, 0]
}
