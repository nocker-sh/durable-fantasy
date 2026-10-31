import { getRoomConnectionOpening } from "#/scripts/lib/get-room-connection-opening"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"

type Props = Readonly<{ room: SettingDocument; target: SettingDocument; connection: Connection; reciprocal: Connection | undefined }>

/** Coincident grid coordinates are insufficient: both physical openings must exist and have opposite outward normals. */
export function areRoomDoorwaysFacing(props: Props): boolean {
  if (!props.room.grid || !props.reciprocal) return false

  const cellMetres = props.room.grid.cell_m
  const opening = getRoomConnectionOpening({ room: props.room, connection: props.connection, cellMetres })
  const targetOpening = getRoomConnectionOpening({ room: props.target, connection: props.reciprocal, cellMetres })

  return !!opening && !!targetOpening && opening.outward[0] === -targetOpening.outward[0] && opening.outward[1] === -targetOpening.outward[1]
}
