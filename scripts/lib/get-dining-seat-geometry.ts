import { getChairSections } from "#/world/town/get-chair-sections"
import { seatDimensions } from "#/scripts/lib/seat-dimensions"
import { workSurface } from "#/scripts/lib/work-surface"
import { seatForward } from "#/world/town/seat-forward"
import { seatHeading } from "#/world/town/seat-heading"
import { workTableSections } from "#/world/town/work-table"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Furniture = NonNullable<SettingDocument["furniture"]>[number]
type Props = { chair: Furniture; table: Furniture; cell: number }

/** Convert the same authored chair and table sections used for drawing to native character coordinates. */
export function getDiningSeatGeometry(props: Props) {
  try {
    const chair = props.chair,
      table = props.table,
      k = props.cell
    const seat = seatDimensions(chair.seat, chair.rect[2] * k, chair.rect[3] * k)
    if (!seat.facing) return new Error("Dining seat has no facing")
    const surface = workSurface(table.work_surface, table.rect[2] * k, table.rect[3] * k)
    const forward = seatForward(seat.facing),
      offset = seat.occupantForward ?? 0
    const place = {
      at: [(chair.rect[0] + chair.rect[2] / 2) * k + forward[0] * offset, (chair.rect[1] + chair.rect[3] / 2) * k + forward[1] * offset] satisfies [number, number],
      height: seat.height,
      heading: seatHeading(seat.facing),
    }
    const sections = workTableSections({ surface: surface, x: (table.rect[0] + table.rect[2] / 2) * k, z: (table.rect[1] + table.rect[3] / 2) * k, width: table.rect[2] * k, depth: table.rect[3] * k })

    const chairSections = getChairSections({
      seat,
      at: [(chair.rect[0] + chair.rect[2] / 2) * k, (chair.rect[1] + chair.rect[3] / 2) * k],
      floor: 0,
      legInset: 0,
      backThickness: seat.legWidth,
      hasBack: !/揺り/.test(chair.name ?? ""),
    })

    return { place, sections, chairSections }
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid dining seat geometry")
  }
}
