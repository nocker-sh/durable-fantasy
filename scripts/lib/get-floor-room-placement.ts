import { roomOriginSchema, roomGridSchema } from "#/scripts/lib/room-layout-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

type Props = Readonly<{ buildingId: string; floor: number; id: string; room: SettingDocument | undefined }>

/** Decode the placement without rewriting the room's authored metadata or borrowing another floor's frame. */
export function getFloorRoomPlacement(props: Props) {
  const room = props.room
  if (room?.kind !== "rooms" || !room.grid || room.building !== props.buildingId || room.floor !== props.floor) return new Error(`${props.id}: missing grid or wrong building/floor`)

  const origin = roomOriginSchema.safeParse(room.origin)
  if (!origin.success) return new Error(`${props.id}: invalid room origin`)

  const grid = roomGridSchema.safeParse(room.grid)
  if (!grid.success) return new Error(`${props.id}: invalid room grid`)

  return { room, origin: origin.data, grid: grid.data }
}
