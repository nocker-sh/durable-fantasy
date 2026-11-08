import type { SeatSpec } from "#/world/town/room-fixtures"

/** Project the complete seat, including its foot support, without rotating its authored facing. */
export function scaleSeat(seat: SeatSpec, scale: number): SeatSpec {
  if (!Number.isFinite(scale) || scale <= 0) throw new Error("Invalid seat scale")

  return {
    facing: seat.facing,
    width: seat.width * scale,
    depth: seat.depth * scale,
    height: seat.height * scale,
    backHeight: seat.backHeight * scale,
    boardThickness: seat.boardThickness * scale,
    legWidth: seat.legWidth * scale,
    occupantForward: seat.occupantForward === undefined ? undefined : seat.occupantForward * scale,
    footRest: seat.footRest
      ? {
          height: seat.footRest.height * scale,
          width: seat.footRest.width * scale,
          depth: seat.footRest.depth * scale,
          forward: seat.footRest.forward * scale,
          thickness: seat.footRest.thickness * scale,
        }
      : undefined,
  }
}
