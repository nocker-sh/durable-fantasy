import { buildingRoomIdsSchema } from "#/scripts/lib/building-layout-schema"
import { roomConnectionsSchema } from "#/scripts/lib/room-connection-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

type Props = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; seen: ReadonlySet<string> }>

/** A completed building needs a designed section for every upward stair connection. */
export function auditMissingStairSections(props: Props): string[] {
  if (props.building.design_gate !== "通過") return []
  const roomIds = buildingRoomIdsSchema.safeParse(props.building.rooms ?? [])
  if (!roomIds.success) return ["Invalid stair building room inventory"]
  const errors: string[] = []
  for (const id of roomIds.data) {
    const room = props.documents.get(id),
      connections = roomConnectionsSchema.safeParse(room?.connections)
    if (!connections.success) {
      errors.push("Stair has invalid room connections")
      continue
    }
    for (const connection of connections.data) {
      if (connection.kind !== "stair") continue
      const floor = room?.floor,
        targetFloor = props.documents.get(connection.target)?.floor
      if (typeof floor !== "number" || typeof targetFloor !== "number" || !Number.isSafeInteger(floor) || !Number.isSafeInteger(targetFloor)) {
        errors.push("Stair has invalid floor connection")
        continue
      }
      if (targetFloor > floor && !props.seen.has(`${id}:${connection.target}:${connection.furniture}`)) errors.push("Stair has no designed section")
    }
  }
  return errors
}
