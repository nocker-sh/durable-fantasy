import { same } from "#/scripts/lib/building-layout/same"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"

type Props = Readonly<{
  room: SettingDocument
  target: SettingDocument
  origin: readonly [number, number]
  targetOrigin: readonly [number, number]
  connection: Connection
  reciprocal: Connection | undefined
}>

/** A reciprocal door must meet at the same building cell and on the same floor. */
export function auditConnectedRoomDoor(props: Props): string[] {
  const errors: string[] = [],
    door = props.connection.door,
    targetDoor = props.connection.target_door

  if (
    !door ||
    !targetDoor ||
    props.room.floor !== props.target.floor ||
    !same([props.origin[0] + door[0], props.origin[1] + door[1]], [props.targetOrigin[0] + targetDoor[0], props.targetOrigin[1] + targetDoor[1]])
  )
    errors.push(`${props.room.id}: connected doors do not meet`)

  if (props.connection.width_cells !== props.reciprocal?.width_cells) errors.push(`${props.room.id}: door widths disagree`)

  return errors
}
