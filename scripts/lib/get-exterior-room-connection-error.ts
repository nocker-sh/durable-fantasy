import { roomOriginSchema } from "#/scripts/lib/room-layout-schema"
import { getRoomConnectionOpening } from "#/scripts/lib/get-room-connection-opening"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection, Layout } from "#/scripts/lib/building-layout"

type Props = Readonly<{ building: SettingDocument; room: SettingDocument; connection: Connection; target: SettingDocument; layout: Layout }>

/** An outdoor seed must cross an actual opening facing out of the building's ground-floor outline. */
export function getExteriorRoomConnectionError(props: Props): string | null {
  const error = `${props.room.id}: exterior door does not reach the building's outside map`,
    origin = roomOriginSchema.safeParse(props.room.origin)
  const opening = getRoomConnectionOpening({ room: props.room, connection: props.connection, cellMetres: props.layout.cell_m })
  if (props.room.kind !== "rooms" || props.room.building !== props.building.id || !origin.success || !opening) return error
  const x = origin.data[0] + opening.cell[0],
    z = origin.data[1] + opening.cell[1],
    span = props.connection.width_cells ?? 1
  const endX = x + (opening.outward[0] === 0 ? span - 1 : 0),
    endZ = z + (opening.outward[0] === 0 ? 0 : span - 1)
  const onOutline =
    (opening.outward[0] === -1 && x === 0) ||
    (opening.outward[0] === 1 && x === props.layout.width - 1) ||
    (opening.outward[1] === -1 && z === 0) ||
    (opening.outward[1] === 1 && z === props.layout.depth - 1)
  if (
    x < 0 ||
    z < 0 ||
    endX >= props.layout.width ||
    endZ >= props.layout.depth ||
    !onOutline ||
    props.room.floor !== 0 ||
    props.target.kind !== "maps" ||
    typeof props.target.map_kind !== "string" ||
    !["town", "field"].includes(props.target.map_kind) ||
    props.target.id !== props.building.map
  )
    return error
  return null
}
