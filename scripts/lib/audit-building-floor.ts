import { FloorOccupancy } from "#/scripts/lib/floor-occupancy"
import { getFloorRoomPlacement } from "#/scripts/lib/get-floor-room-placement"
import { auditRoomLayoutConnections } from "#/scripts/lib/audit-room-layout-connections"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Layout } from "#/scripts/lib/building-layout"

type Props = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; layout: Layout; floor: Layout["floors"][number]; placed: Set<string> }>

/** Account for every room and cell on one floor, keeping invalid room registrations visible. */
export function auditBuildingFloor(props: Props): readonly string[] {
  const errors: string[] = [],
    cells = new FloorOccupancy(props.layout)

  for (const id of props.floor.rooms) {
    if (props.placed.has(id)) errors.push(`${id}: room occurs more than once`)
    props.placed.add(id)
    const placement = getFloorRoomPlacement({ buildingId: props.building.id, floor: props.floor.floor, id, room: props.documents.get(id) })
    if (placement instanceof Error) {
      errors.push(placement.message)
      continue
    }
    if (placement.grid.cell_m !== props.layout.cell_m) errors.push(`${id}: inconsistent cell scale`)
    errors.push(...cells.addRoom({ id, origin: placement.origin, rows: placement.grid.rows }))
    errors.push(
      ...auditRoomLayoutConnections({
        building: props.building,
        room: placement.room,
        origin: placement.origin,
        rows: placement.grid.rows,
        cellMetres: props.layout.cell_m,
        documents: props.documents,
      }),
    )
  }

  if (cells.size !== props.layout.width * props.layout.depth) errors.push(`Floor ${props.floor.floor}: unassigned building cells`)
  return errors
}
