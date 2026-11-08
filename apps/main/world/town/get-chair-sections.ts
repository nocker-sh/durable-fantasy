import { seatRect } from "#/world/town/seat-rect"
import { footRestSections } from "#/world/town/foot-rest"
import type { SeatSpec } from "#/world/town/room-fixtures"
export type ChairSection = {
  readonly part: "leg" | "seat" | "back" | "board" | "bearer"
  readonly x0: number
  readonly y0: number
  readonly z0: number
  readonly x1: number
  readonly y1: number
  readonly z1: number
}
type Props = { seat: SeatSpec; at: readonly [number, number]; floor: number; legInset: number; backThickness: number; hasBack: boolean }

/** Use the same rotated solid parts for the chair mesh, body clearance and the seat's separate support review. */
export function getChairSections(props: Props): readonly ChairSection[] {
  const seat = props.seat,
    bottom = props.floor + seat.height - seat.boardThickness
  const legs = [-1, 1].flatMap((across) =>
    [-1, 1].map((along): ChairSection => {
      const x = across * ((seat.width - seat.legWidth) / 2 - props.legInset),
        z = along * ((seat.depth - seat.legWidth) / 2 - props.legInset),
        half = seat.legWidth / 2
      return { part: "leg", x0: x - half, y0: props.floor, z0: z - half, x1: x + half, y1: bottom, z1: z + half }
    }),
  )
  const board: ChairSection = { part: "seat", x0: -seat.width / 2, y0: bottom, z0: -seat.depth / 2, x1: seat.width / 2, y1: props.floor + seat.height, z1: seat.depth / 2 }
  const frame = [...legs, board].map((section) => ({
    ...section,
    ...seatRect({ facing: seat.facing ?? "n", x0: section.x0, z0: section.z0, x1: section.x1, z1: section.z1, x: props.at[0], z: props.at[1] }),
  }))
  const back: ChairSection[] = []
  if (props.hasBack) {
    const rectangle = seatRect({ facing: seat.facing ?? "n", x0: -seat.width / 2, z0: seat.depth / 2 - props.backThickness, x1: seat.width / 2, z1: seat.depth / 2, x: props.at[0], z: props.at[1] })
    back.push({ part: "back", ...rectangle, y0: props.floor + seat.height, y1: props.floor + seat.backHeight })
  }

  return [...frame, ...footRestSections({ seat: seat, x: props.at[0], z: props.at[1], floor: props.floor }), ...back]
}
