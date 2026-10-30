import { seatRect } from "#/world/town/seat-rect"
import type { SeatSpec } from "./room-fixtures"

export type FootRestSection = {
  part: "board" | "bearer"
  x0: number
  y0: number
  z0: number
  x1: number
  y1: number
  z1: number
}

/** The same solid sections serve physical checks and rendering, in the caller's units. */
export function footRestSections(inputProps: { seat: SeatSpec; x: number; z: number; floor?: number }): FootRestSection[] {
  const seat = inputProps.seat
  const x = inputProps.x
  const z = inputProps.z
  const floor = inputProps.floor === undefined ? 0 : inputProps.floor

  const rest = seat.footRest
  if (!rest) return []
  const y0 = floor + rest.height - rest.thickness
  const y1 = floor + rest.height
  const front = z - rest.forward - rest.depth / 2
  const sections: FootRestSection[] = [
    { part: "board", x0: x - rest.width / 2, y0, z0: front, x1: x + rest.width / 2, y1, z1: front + rest.depth },
    ...[-1, 1].map((side) => {
      const centre = x + (side * (seat.width - seat.legWidth)) / 2
      return {
        part: "bearer" as const,
        x0: centre - seat.legWidth / 2,
        y0,
        z0: front,
        x1: centre + seat.legWidth / 2,
        y1,
        z1: z + (seat.depth - seat.legWidth) / 2,
      }
    }),
  ]
  return sections.map((section) => ({ ...section, ...seatRect({ facing: seat.facing ?? "n", x0: section.x0 - x, z0: section.z0 - z, x1: section.x1 - x, z1: section.z1 - z, x: x, z: z }) }))
}
